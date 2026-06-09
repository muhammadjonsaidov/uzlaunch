package uz.uzlaunch.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.uzlaunch.api.dto.request.AdminAuthRequest;
import uz.uzlaunch.api.dto.response.ErrorResponse;
import uz.uzlaunch.api.dto.response.ProjectResponse;
import uz.uzlaunch.api.dto.response.UserResponse;
import uz.uzlaunch.security.JwtTokenService;
import uz.uzlaunch.service.AdminService;
import uz.uzlaunch.service.RateLimiter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin-only endpoints. Authenticate via POST /api/admin/auth first.")
public class AdminApiController {

    @Autowired private AdminService adminService;
    @Autowired private JwtTokenService jwtTokenService;

    @Autowired
    @Qualifier("adminRateLimiter")
    private RateLimiter adminRateLimiter;

    @Value("${admin.secret}")
    private String adminSecret;

    @Value("${app.trust-proxy:false}")
    private boolean trustProxy;

    @PostMapping("/auth")
    @Operation(summary = "Get admin JWT", description = "Returns short-lived JWT with ROLE_ADMIN. Rate limited: 5/15 min per IP.")
    public ResponseEntity<?> auth(@Valid @RequestBody AdminAuthRequest req, HttpServletRequest request) {
        if (!adminRateLimiter.isAllowed(resolveIp(request))) {
            return ResponseEntity.status(429).body(new ErrorResponse("RATE_LIMITED", "Too many attempts"));
        }
        if (!adminSecret.equals(req.secret())) {
            return ResponseEntity.status(401).body(new ErrorResponse("INVALID_CREDENTIALS", "Wrong secret"));
        }
        return ResponseEntity.ok(Map.of("token", jwtTokenService.issueAdmin()));
    }

    @GetMapping("/stats")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Platform-wide stats: users, projects, subscribers, daily signups")
    public ResponseEntity<Map<String, Object>> stats() {
        AdminService.AdminStats s = adminService.getStats();
        return ResponseEntity.ok(Map.of(
                "userCount", s.userCount(),
                "projectCount", s.projectCount(),
                "subscriberCount", s.subscriberCount(),
                "todaySignups", s.todaySignups(),
                "users", s.users().stream().map(UserResponse::from).toList(),
                "projects", s.projects().stream().map(ProjectResponse::from).toList(),
                "dailySignups", s.dailySignups()
        ));
    }

    @PostMapping("/users/{id}/upgrade")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Upgrade user to PRO plan")
    public ResponseEntity<Map<String, String>> upgrade(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("message", "Upgraded " + adminService.upgradeUser(id) + " to Pro"));
    }

    @PostMapping("/users/{id}/downgrade")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Downgrade user to FREE plan")
    public ResponseEntity<Map<String, String>> downgrade(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("message", "Downgraded " + adminService.downgradeUser(id) + " to Free"));
    }

    @PostMapping("/users/{id}/ban")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Ban user — blocks login")
    public ResponseEntity<Map<String, String>> ban(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("message", "Banned " + adminService.banUser(id)));
    }

    @PostMapping("/users/{id}/unban")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Unban user")
    public ResponseEntity<Map<String, String>> unban(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("message", "Unbanned " + adminService.unbanUser(id)));
    }

    @DeleteMapping("/users/{id}")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Delete user and all their projects + subscribers")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("message", "Deleted user " + adminService.deleteUser(id)));
    }

    @DeleteMapping("/projects/{id}")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Delete project and all its subscribers")
    public ResponseEntity<Map<String, String>> deleteProject(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("message", "Deleted project " + adminService.deleteProject(id)));
    }

    private String resolveIp(HttpServletRequest request) {
        if (trustProxy) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}