package uz.uzlaunch.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.uzlaunch.api.dto.response.ErrorResponse;
import uz.uzlaunch.api.dto.response.ProjectResponse;
import uz.uzlaunch.api.dto.response.UserResponse;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.User;
import uz.uzlaunch.security.JwtTokenService;
import uz.uzlaunch.service.AdminService;
import uz.uzlaunch.service.RateLimiter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
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
    public ResponseEntity<?> auth(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String ip = resolveIp(request);
        if (!adminRateLimiter.isAllowed(ip)) {
            return ResponseEntity.status(429).body(new ErrorResponse("RATE_LIMITED", "Too many attempts"));
        }
        String secret = body.get("secret");
        if (secret == null || !adminSecret.equals(secret)) {
            return ResponseEntity.status(401).body(new ErrorResponse("INVALID_CREDENTIALS", "Wrong secret"));
        }
        return ResponseEntity.ok(Map.of("token", jwtTokenService.issueAdmin()));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        AdminService.AdminStats s = adminService.getStats();
        List<UserResponse> users = s.users().stream().map(UserResponse::from).toList();
        List<ProjectResponse> projects = s.projects().stream().map(ProjectResponse::from).toList();
        return ResponseEntity.ok(Map.of(
                "userCount", s.userCount(),
                "projectCount", s.projectCount(),
                "subscriberCount", s.subscriberCount(),
                "todaySignups", s.todaySignups(),
                "users", users,
                "projects", projects,
                "dailySignups", s.dailySignups()
        ));
    }

    @PostMapping("/users/{id}/upgrade")
    public ResponseEntity<Map<String, String>> upgrade(@PathVariable String id) {
        String email = adminService.upgradeUser(id);
        return ResponseEntity.ok(Map.of("message", "Upgraded " + email + " to Pro"));
    }

    @PostMapping("/users/{id}/downgrade")
    public ResponseEntity<Map<String, String>> downgrade(@PathVariable String id) {
        String email = adminService.downgradeUser(id);
        return ResponseEntity.ok(Map.of("message", "Downgraded " + email + " to Free"));
    }

    @PostMapping("/users/{id}/ban")
    public ResponseEntity<Map<String, String>> ban(@PathVariable String id) {
        String email = adminService.banUser(id);
        return ResponseEntity.ok(Map.of("message", "Banned " + email));
    }

    @PostMapping("/users/{id}/unban")
    public ResponseEntity<Map<String, String>> unban(@PathVariable String id) {
        String email = adminService.unbanUser(id);
        return ResponseEntity.ok(Map.of("message", "Unbanned " + email));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id) {
        String email = adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "Deleted user " + email));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Map<String, String>> deleteProject(@PathVariable Long id) {
        String name = adminService.deleteProject(id);
        return ResponseEntity.ok(Map.of("message", "Deleted project " + name));
    }

    private String resolveIp(HttpServletRequest request) {
        if (trustProxy) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }
}