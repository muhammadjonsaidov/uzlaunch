package uz.uzlaunch.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import uz.uzlaunch.model.User;
import uz.uzlaunch.repository.UserRepository;

import java.io.IOException;
import java.util.UUID;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Autowired private UserRepository userRepo;
    @Autowired private JwtTokenService jwtTokenService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = extractEmail(oAuth2User);
        String name = extractName(oAuth2User);

        if (email == null) {
            response.sendRedirect(frontendUrl + "/login?error=oauth_no_email");
            return;
        }

        email = email.trim().toLowerCase();
        final String normalizedEmail = email;

        User user = userRepo.findByEmail(normalizedEmail).orElseGet(() -> {
            User u = new User();
            u.setId(UUID.randomUUID().toString());
            u.setEmail(normalizedEmail);
            u.setName(name != null && !name.isBlank() ? name.trim() : normalizedEmail.split("@")[0]);
            u.setEmailVerified(true);
            return userRepo.save(u);
        });

        if (user.isBanned()) {
            response.sendRedirect(frontendUrl + "/login?error=banned");
            return;
        }

        String token = jwtTokenService.issue(user);
        response.sendRedirect(frontendUrl + "/oauth2/callback?token=" + token);
    }

    private String extractEmail(OAuth2User user) {
        Object email = user.getAttribute("email");
        return email != null ? email.toString() : null;
    }

    private String extractName(OAuth2User user) {
        Object name = user.getAttribute("name");
        return name != null ? name.toString() : null;
    }
}