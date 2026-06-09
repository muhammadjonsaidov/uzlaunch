package uz.uzlaunch.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import uz.uzlaunch.api.dto.request.LoginApiRequest;
import uz.uzlaunch.api.dto.request.RegisterApiRequest;
import uz.uzlaunch.api.dto.response.AuthResponse;
import uz.uzlaunch.api.dto.response.ErrorResponse;
import uz.uzlaunch.api.dto.response.MessageResponse;
import uz.uzlaunch.api.dto.response.UserResponse;
import uz.uzlaunch.dto.LoginRequest;
import uz.uzlaunch.dto.RegisterRequest;
import uz.uzlaunch.exception.PageNotFoundException;
import uz.uzlaunch.model.User;
import uz.uzlaunch.repository.UserRepository;
import uz.uzlaunch.security.JwtTokenService;
import uz.uzlaunch.service.AuthService;
import uz.uzlaunch.service.RateLimiter;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Registration, login, email verification, profile")
@RequiredArgsConstructor
public class AuthApiController {

    private final AuthService authService;
    private final JwtTokenService jwtTokenService;
    private final UserRepository userRepo;

    @Qualifier("registerRateLimiter")
    private final RateLimiter registerRateLimiter;

    @Value("${app.trust-proxy:false}")
    private final boolean trustProxy;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Creates account and sends verification email. Login only after email confirmed.")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterApiRequest req,
                                      HttpServletRequest request) {
        String ip = resolveIp(request);
        if (!registerRateLimiter.isAllowed(ip)) {
            return ResponseEntity.status(429).body(new ErrorResponse("RATE_LIMITED", "Too many registrations. Try again later."));
        }
        RegisterRequest dto = new RegisterRequest();
        dto.setName(req.name());
        dto.setEmail(req.email());
        dto.setPassword(req.password());
        authService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponse("Verification email sent. Please check your inbox."));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email + password", description = "Returns JWT. Email must be verified first.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginApiRequest req) {
        LoginRequest dto = new LoginRequest();
        dto.setEmail(req.email());
        dto.setPassword(req.password());
        User user = authService.login(dto);
        return ResponseEntity.ok(new AuthResponse(jwtTokenService.issue(user), UserResponse.from(user)));
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verify email via token", description = "?token=UUID — called after user clicks link in email")
    public ResponseEntity<MessageResponse> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(new MessageResponse("Email verified. You can now log in."));
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal Jwt jwt) {
        User user = userRepo.findById(jwt.getSubject()).orElseThrow(PageNotFoundException::new);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    private String resolveIp(HttpServletRequest request) {
        if (trustProxy) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}