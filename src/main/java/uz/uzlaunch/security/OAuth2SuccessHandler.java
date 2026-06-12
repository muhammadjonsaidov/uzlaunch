package uz.uzlaunch.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import uz.uzlaunch.model.User;
import uz.uzlaunch.repository.UserRepository;
import uz.uzlaunch.service.EmailService;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepo;
    private final JwtTokenService jwtTokenService;
    private final EmailService emailService;
    private final uz.uzlaunch.service.AuthService authService;

    @Value("${app.frontend-url}")
    private final String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String registrationId = ((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId();
        User.AuthProvider provider = "github".equals(registrationId)
                ? User.AuthProvider.GITHUB : User.AuthProvider.GOOGLE;

        String email = extractEmail(oAuth2User, registrationId);
        String name = extractName(oAuth2User);

        if (email == null) {
            response.sendRedirect(frontendUrl + "/login?error=oauth_no_email");
            return;
        }

        email = email.trim().toLowerCase();
        final String normalizedEmail = email;
        final boolean[] isNew = {false};

        final String finalName = name;
        User user = userRepo.findByEmail(normalizedEmail).orElseGet(() -> {
            User u = new User();
            u.setId(UUID.randomUUID().toString());
            u.setEmail(normalizedEmail);
            u.setName(finalName != null && !finalName.isBlank() ? finalName.trim() : normalizedEmail.split("@")[0]);
            u.setAuthProvider(provider);
            u.setEmailVerified(true);
            u.setUsername(authService.generateUsername(u.getName(), normalizedEmail));
            isNew[0] = true;
            return userRepo.save(u);
        });

        if (user.isBanned()) {
            response.sendRedirect(frontendUrl + "/login?error=banned");
            return;
        }

        if (user.getAuthProvider() == User.AuthProvider.LOCAL) {
            response.sendRedirect(frontendUrl + "/login?error=use_password");
            return;
        }

        if (user.getAuthProvider() != provider) {
            String other = user.getAuthProvider().name().toLowerCase();
            response.sendRedirect(frontendUrl + "/login?error=use_" + other);
            return;
        }

        if (isNew[0]) {
            emailService.sendWelcomeEmail(user.getEmail(), user.getName());
        }

        String token = jwtTokenService.issue(user);
        response.sendRedirect(frontendUrl + "/oauth2/callback#token=" + token);
    }

    private String extractEmail(OAuth2User user, String registrationId) {
        Object email = user.getAttribute("email");
        return email != null ? email.toString() : null;
    }

    private String extractName(OAuth2User user) {
        Object name = user.getAttribute("name");
        return name != null ? name.toString() : null;
    }
}
