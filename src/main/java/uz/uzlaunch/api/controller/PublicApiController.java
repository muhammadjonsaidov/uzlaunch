package uz.uzlaunch.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.uzlaunch.api.dto.response.ProjectResponse;
import uz.uzlaunch.dto.SubscribeRequest;
import uz.uzlaunch.service.ProjectService;
import uz.uzlaunch.service.SubscriberService;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicApiController {

    @Autowired private ProjectService projectService;
    @Autowired private SubscriberService subscriberService;

    @Value("${app.trust-proxy:false}")
    private boolean trustProxy;

    @GetMapping("/projects/{slug}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable String slug) {
        return ResponseEntity.ok(ProjectResponse.from(projectService.getBySlug(slug)));
    }

    @PostMapping("/projects/{slug}/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(@PathVariable String slug,
                                                          @Valid @RequestBody SubscribeRequest req,
                                                          HttpServletRequest request) {
        subscriberService.subscribe(slug, req, resolveIp(request));
        return ResponseEntity.ok(Map.of("message", "Confirmation email sent. Please check your inbox."));
    }

    @GetMapping("/confirm")
    public ResponseEntity<Map<String, String>> confirm(@RequestParam String token) {
        String slug = subscriberService.confirmSubscription(token);
        return ResponseEntity.ok(Map.of("message", "Subscription confirmed!", "slug", slug));
    }

    @GetMapping("/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(@RequestParam String token) {
        String projectName = subscriberService.unsubscribe(token);
        return ResponseEntity.ok(Map.of("message", "Unsubscribed from " + projectName));
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