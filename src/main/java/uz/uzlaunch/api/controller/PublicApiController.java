package uz.uzlaunch.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import uz.uzlaunch.service.SseService;
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
    private final uz.uzlaunch.service.ValidationScoreService scoreService;
    private final SseService sseService;
    private final uz.uzlaunch.service.AnalyticsService analyticsService;
    private final uz.uzlaunch.service.TemplateService templateService;

    @Value("${app.trust-proxy:false}")
    private final boolean trustProxy;

    @GetMapping("/projects/{slug}")
    @Operation(summary = "Get public project page by slug")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable String slug) {
        return ResponseEntity.ok(ProjectResponse.from(projectService.getBySlug(slug)));
    }

    @GetMapping("/manage")
    @Operation(summary = "Get subscriber details by token", description = "Returns subscriber info + position + project metadata. ?token=UUID")
    public ResponseEntity<uz.uzlaunch.api.dto.response.SubscriberManageResponse> getManage(@RequestParam String token) {
        return ResponseEntity.ok(subscriberService.getByToken(token));
    }

    @PutMapping("/manage")
    @Operation(summary = "Update subscriber name + commitment by token", description = "?token=UUID, body: {name, commitment}")
    public ResponseEntity<uz.uzlaunch.api.dto.response.SubscriberManageResponse> updateManage(
            @RequestParam String token,
            @Valid @RequestBody uz.uzlaunch.api.dto.request.SubscriberUpdateRequest req) {
        return ResponseEntity.ok(subscriberService.updateByToken(token, req.name(), req.commitment()));
    }

    @GetMapping("/founders/{username}")
    @Operation(summary = "Public founder profile + their public projects")
    public ResponseEntity<uz.uzlaunch.api.dto.response.FounderProfileResponse> founder(@PathVariable String username) {
        return ResponseEntity.ok(projectService.founderProfile(username));
    }

    @GetMapping("/leaderboard")
    @Operation(summary = "Top public waitlists ranked by score + momentum",
               description = "period: week | month (default week). Returns top 50.")
    public ResponseEntity<java.util.List<ProjectResponse>> leaderboard(
            @RequestParam(defaultValue = "week") String period) {
        return ResponseEntity.ok(projectService.leaderboard(period));
    }

    @GetMapping("/templates")
    @Operation(summary = "Curated waitlist starter templates")
    public ResponseEntity<java.util.List<uz.uzlaunch.service.TemplateService.Template>> templates() {
        return ResponseEntity.ok(templateService.list());
    }

    @GetMapping("/explore")
    @Operation(summary = "Browse public waitlists",
               description = "sort: trending (last 7d momentum, default) | newest | top. Paginated 12/page.")
    public ResponseEntity<uz.uzlaunch.api.dto.response.PagedResponse<ProjectResponse>> explore(
            @RequestParam(defaultValue = "trending") String sort,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(projectService.explore(sort, Math.max(0, page)));
    }

    @PostMapping("/projects/{slug}/track")
    @Operation(summary = "Track a page event (view, form_start)",
               description = "Fire-and-forget — body: {\"event\":\"view\"|\"form_start\",\"utmSource\":\"...\"}")
    public ResponseEntity<Void> track(@PathVariable String slug, @RequestBody java.util.Map<String, String> body) {
        String event = body.get("event");
        if (event == null) return ResponseEntity.noContent().build();
        try {
            analyticsService.track(projectService.getBySlug(slug), event, body.get("utmSource"));
        } catch (Exception ignored) {}
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/projects/{slug}/subscribe")
    @Operation(summary = "Subscribe to waitlist", description = "Sends double opt-in confirmation email. Rate limited: 3/hour per IP.")
    public ResponseEntity<MessageResponse> subscribe(@PathVariable String slug,
                                                      @Valid @RequestBody SubscribeApiRequest req,
                                                      HttpServletRequest request) {
        SubscribeRequest dto = new SubscribeRequest();
        dto.setEmail(req.email());
        dto.setName(req.name());
        dto.setCommitment(req.commitment());
        dto.setFeedbackAnswer(req.feedbackAnswer());
        dto.setRef(req.ref());
        dto.setUtmSource(req.utmSource());
        dto.setUtmMedium(req.utmMedium());
        dto.setUtmCampaign(req.utmCampaign());
        subscriberService.subscribe(slug, dto, resolveIp(request));
        return ResponseEntity.ok(new MessageResponse("Confirmation email sent. Please check your inbox."));
    }

    @GetMapping("/confirm")
    @Operation(summary = "Confirm subscription via email token", description = "?token=UUID")
    public ResponseEntity<SubscribeConfirmResponse> confirm(@RequestParam String token) {
        SubscriberService.ConfirmResult r = subscriberService.confirmSubscription(token);
        return ResponseEntity.ok(new SubscribeConfirmResponse("Subscription confirmed!", r.slug(), r.position(), r.total(), r.referralCode()));
    }

    @GetMapping("/unsubscribe")
    @Operation(summary = "Unsubscribe via token", description = "?token=UUID")
    public ResponseEntity<MessageResponse> unsubscribe(@RequestParam String token) {
        String projectName = subscriberService.unsubscribe(token);
        return ResponseEntity.ok(new MessageResponse("Unsubscribed from " + projectName));
    }

    @GetMapping(value = "/projects/{slug}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Live subscriber count stream (SSE)")
    public SseEmitter stream(@PathVariable String slug) {
        uz.uzlaunch.model.Project p = projectService.getBySlug(slug);
        return sseService.subscribe(p.getId());
    }

    @GetMapping("/projects/{slug}/score")
    @Operation(summary = "Get validation score breakdown for a project")
    public ResponseEntity<uz.uzlaunch.api.dto.response.ValidationScoreResponse> score(@PathVariable String slug) {
        uz.uzlaunch.model.Project p = projectService.getBySlug(slug);
        uz.uzlaunch.service.ValidationScoreService.ScoreBreakdown bd = scoreService.compute(p);
        return ResponseEntity.ok(new uz.uzlaunch.api.dto.response.ValidationScoreResponse(
                bd.score(), bd.confirmed(),
                bd.volumePoints(), bd.commitmentPoints(), bd.momentumPoints(),
                bd.wouldUse(), bd.wouldPay(), bd.payNow()));
    }

    @GetMapping(value = "/projects/{slug}/badge.svg", produces = "image/svg+xml")
    @Operation(summary = "Embeddable SVG validation badge")
    public ResponseEntity<String> badge(@PathVariable String slug) {
        uz.uzlaunch.model.Project p = projectService.getBySlug(slug);
        int score = p.getValidationScore();
        int confirmed = p.getSubscriberCount();
        String label = "validated";
        String value = confirmed + " · score " + score;
        int labelW = 72, valueW = value.length() * 7 + 10, totalW = labelW + valueW;
        String color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#6366f1";
        String svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + totalW + "\" height=\"20\">"
            + "<linearGradient id=\"s\" x2=\"0\" y2=\"100%\"><stop offset=\"0\" stop-color=\"#bbb\" stop-opacity=\".1\"/><stop offset=\"1\" stop-opacity=\".1\"/></linearGradient>"
            + "<rect rx=\"3\" width=\"" + totalW + "\" height=\"20\" fill=\"#555\"/>"
            + "<rect rx=\"3\" x=\"" + labelW + "\" width=\"" + valueW + "\" height=\"20\" fill=\"" + color + "\"/>"
            + "<rect rx=\"3\" width=\"" + totalW + "\" height=\"20\" fill=\"url(#s)\"/>"
            + "<g fill=\"#fff\" text-anchor=\"middle\" font-family=\"DejaVu Sans,Verdana,Geneva,sans-serif\" font-size=\"11\">"
            + "<text x=\"" + (labelW / 2) + "\" y=\"15\" fill=\"#010101\" fill-opacity=\".3\">" + label + "</text>"
            + "<text x=\"" + (labelW / 2) + "\" y=\"14\">" + label + "</text>"
            + "<text x=\"" + (labelW + valueW / 2) + "\" y=\"15\" fill=\"#010101\" fill-opacity=\".3\">" + value + "</text>"
            + "<text x=\"" + (labelW + valueW / 2) + "\" y=\"14\">" + value + "</text>"
            + "</g></svg>";
        return ResponseEntity.ok()
                .header("Cache-Control", "public, max-age=300")
                .body(svg);
    }

    private String resolveIp(HttpServletRequest request) {
        if (trustProxy) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}