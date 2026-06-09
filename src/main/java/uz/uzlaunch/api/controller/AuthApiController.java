package uz.uzlaunch.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import uz.uzlaunch.api.dto.request.LoginApiRequest;
import uz.uzlaunch.api.dto.request.RegisterApiRequest;
import uz.uzlaunch.api.dto.response.AuthResponse;
import uz.uzlaunch.api.dto.response.UserResponse;
import uz.uzlaunch.dto.LoginRequest;
import uz.uzlaunch.dto.RegisterRequest;
import uz.uzlaunch.exception.PageNotFoundException;
import uz.uzlaunch.model.User;
import uz.uzlaunch.repository.UserRepository;
import uz.uzlaunch.security.JwtTokenService;
import uz.uzlaunch.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Registration, login, profile")
public class AuthApiController {

    @Autowired private AuthService authService;
    @Autowired private JwtTokenService jwtTokenService;
    @Autowired private UserRepository userRepo;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Creates account and sends verification email. Login only after email confirmed.")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterApiRequest req) {
        RegisterRequest dto = new RegisterRequest();
        dto.setName(req.name());
        dto.setEmail(req.email());
        dto.setPassword(req.password());
        authService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Verification email sent. Please check your inbox."));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email + password", description = "Returns JWT token. Email must be verified first.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginApiRequest req) {
        LoginRequest dto = new LoginRequest();
        dto.setEmail(req.email());
        dto.setPassword(req.password());
        User user = authService.login(dto);
        return ResponseEntity.ok(new AuthResponse(jwtTokenService.issue(user), UserResponse.from(user)));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    @SecurityRequirement(name = "Bearer")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal Jwt jwt) {
        User user = userRepo.findById(jwt.getSubject()).orElseThrow(PageNotFoundException::new);
        return ResponseEntity.ok(UserResponse.from(user));
    }
}