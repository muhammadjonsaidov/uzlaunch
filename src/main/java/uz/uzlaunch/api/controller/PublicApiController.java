package uz.uzlaunch.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.uzlaunch.api.dto.request.SubscribeApiRequest;
import uz.uzlaunch.api.dto.response.MessageResponse;
import uz.uzlaunch.api.dto.response.ProjectResponse;
import uz.uzlaunch.api.dto.response.SubscribeConfirmResponse;
import uz.uzlaunch.dto.SubscribeRequest;
import uz.uzlaunch.service.ProjectService;
import uz.uzlaunch.service.SubscriberService;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Public", description = "Public project page, subscribe, confirm, unsubscribe — no auth required")
@RequiredArgsConstructor
public class PublicApiController {

    private final ProjectService projectService;
    private final SubscriberService subscriberService;

    @Value("${app.trust-proxy:false}")
    private final boolean trustProxy;

    @GetMapping("/projects/{slug}")
    @Operation(summary = "Get public project page by slug")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable String slug) {
        return ResponseEntity.ok(ProjectResponse.from(projectService.getBySlug(slug)));
    }

    @PostMapping("/projects/{slug}/subscribe")
    @Operation(summary = "Subscribe to waitlist", description = "Sends double opt-in confirmation email. Rate limited: 3/hour per IP.")
    public ResponseEntity<MessageResponse> subscribe(@PathVariable String slug,
                                                      @Valid @RequestBody SubscribeApiRequest req,
                                                      HttpServletRequest request) {
        SubscribeRequest dto = new SubscribeRequest();
        dto.setEmail(req.email());
        dto.setName(req.name());
        subscriberService.subscribe(slug, dto, resolveIp(request));
        return ResponseEntity.ok(new MessageResponse("Confirmation email sent. Please check your inbox."));
    }

    @GetMapping("/confirm")
    @Operation(summary = "Confirm subscription via email token", description = "?token=UUID")
    public ResponseEntity<SubscribeConfirmResponse> confirm(@RequestParam String token) {
        String slug = subscriberService.confirmSubscription(token);
        return ResponseEntity.ok(new SubscribeConfirmResponse("Subscription confirmed!", slug));
    }

    @GetMapping("/unsubscribe")
    @Operation(summary = "Unsubscribe via token", description = "?token=UUID")
    public ResponseEntity<MessageResponse> unsubscribe(@RequestParam String token) {
        String projectName = subscriberService.unsubscribe(token);
        return ResponseEntity.ok(new MessageResponse("Unsubscribed from " + projectName));
    }

    private String resolveIp(HttpServletRequest request) {
        if (trustProxy) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}