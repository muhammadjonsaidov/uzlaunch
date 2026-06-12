package uz.uzlaunch.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import uz.uzlaunch.api.dto.request.ProjectApiRequest;
import uz.uzlaunch.api.dto.response.*;
import uz.uzlaunch.dto.ProjectCreateRequest;
import uz.uzlaunch.exception.PageNotFoundException;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.User;
import uz.uzlaunch.repository.UserRepository;
import uz.uzlaunch.service.ProjectService;
import uz.uzlaunch.service.SubscriberService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@SecurityRequirement(name = "Bearer")
@Tag(name = "Projects", description = "Project CRUD, subscribers, stats, export")
@RequiredArgsConstructor
public class ProjectApiController {

    private final ProjectService projectService;
    private final SubscriberService subscriberService;
    private final UserRepository userRepo;
    private final uz.uzlaunch.service.AnalyticsService analyticsService;
    private final uz.uzlaunch.service.TemplateService templateService;

    private User resolveUser(Jwt jwt) {
        return userRepo.findById(jwt.getSubject()).orElseThrow(PageNotFoundException::new);
    }

    private ProjectCreateRequest toCreateRequest(ProjectApiRequest req) {
        ProjectCreateRequest r = new ProjectCreateRequest();
        r.setName(req.name());
        r.setTagline(req.tagline());
        r.setDescription(req.description());
        r.setLaunchAt(req.launchAt());
        r.setLaunchEmailSubject(req.launchEmailSubject());
        r.setLaunchEmailBody(req.launchEmailBody());
        r.setConfirmEmailSubject(req.confirmEmailSubject());
        r.setConfirmEmailBody(req.confirmEmailBody());
        r.setFeedbackQuestion(req.feedbackQuestion());
        r.setLogoUrl(req.logoUrl());
        r.setAccentColor(req.accentColor());
        r.setIsPublic(req.isPublic());
        return r;
    }

    @GetMapping
    @Operation(summary = "List user's projects")
    public ResponseEntity<List<ProjectResponse>> list(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(
                projectService.listByUser(resolveUser(jwt)).stream().map(ProjectResponse::from).toList()
        );
    }

    @PostMapping
    @Operation(summary = "Create project", description = "FREE plan: max 1 project. PRO: unlimited.")
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectApiRequest req,
                                                   @AuthenticationPrincipal Jwt jwt) {
        Project p = projectService.create(toCreateRequest(req), resolveUser(jwt));
        return ResponseEntity.status(HttpStatus.CREATED).body(ProjectResponse.from(p));
    }

    @GetMapping("/template/{slug}")
    @Operation(summary = "Get template prefill data (auth needed to ensure rate fairness)")
    public ResponseEntity<uz.uzlaunch.service.TemplateService.Template> template(@PathVariable String slug) {
        return ResponseEntity.ok(templateService.get(slug));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Project detail with paginated confirmed subscribers", description = "?page=0&q=search")
    public ResponseEntity<ProjectDetailResponse> detail(@PathVariable Long id,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(required = false) String q,
                                                         @AuthenticationPrincipal Jwt jwt) {
        User user = resolveUser(jwt);
        ProjectService.ProjectDetail detail = projectService.getProjectDetail(id, user, page, q);
        var f = analyticsService.computeFunnel(detail.project());
        return ResponseEntity.ok(new ProjectDetailResponse(
                ProjectResponse.from(detail.project()),
                new PagedResponse<>(
                        detail.subscribers().stream().map(SubscriberResponse::from).toList(),
                        detail.page(), detail.totalPages(), detail.total()
                ),
                detail.pending().size(),
                detail.locked(),
                detail.pending().stream().map(SubscriberResponse::from).toList(),
                detail.commitmentBreakdown(),
                detail.sourceBreakdown(),
                new ProjectDetailResponse.FunnelResponse(
                    f.views(), f.formStarts(), f.subscribed(), f.confirmed(),
                    f.formStartRate(), f.subscribeRate(), f.confirmRate(), f.overallRate()
                )
        ));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update project")
    public ResponseEntity<ProjectResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody ProjectApiRequest req,
                                                   @AuthenticationPrincipal Jwt jwt) {
        Project p = projectService.update(id, toCreateRequest(req), resolveUser(jwt));
        return ResponseEntity.ok(ProjectResponse.from(p));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete project and all its subscribers")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        projectService.delete(id, resolveUser(jwt));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/export")
    @Operation(summary = "Export confirmed subscribers as JSON list", description = "PRO plan only.")
    public ResponseEntity<List<SubscriberResponse>> export(@PathVariable Long id,
                                                            @AuthenticationPrincipal Jwt jwt) {
        ProjectService.ExportData data = projectService.getExportData(id, resolveUser(jwt));
        return ResponseEntity.ok(data.subscribers().stream().map(SubscriberResponse::from).toList());
    }

    @GetMapping("/{id}/stats")
    @Operation(summary = "Daily subscription chart data", description = "FREE: 7 days. PRO: 30 days.")
    public ResponseEntity<StatsResponse> stats(@PathVariable Long id,
                                                @AuthenticationPrincipal Jwt jwt) {
        User user = resolveUser(jwt);
        Project p = projectService.getOwned(id, user);
        Map<String, Object> raw = projectService.getStats(p.getSlug(), user);

        @SuppressWarnings("unchecked")
        List<ChartBar> chartData = ((List<Map<String, Object>>) raw.get("chartData"))
                .stream().map(ChartBar::from).toList();

        return ResponseEntity.ok(new StatsResponse(
                ProjectResponse.from(p),
                chartData,
                ((Number) raw.get("totalSubscribers")).longValue(),
                ((Number) raw.get("statsDays")).intValue(),
                ((Number) raw.get("last7Days")).longValue()
        ));
    }

    @DeleteMapping("/{id}/subscribers/{subId}")
    @Operation(summary = "Delete a subscriber")
    public ResponseEntity<Void> deleteSubscriber(@PathVariable Long id,
                                                  @PathVariable Long subId,
                                                  @AuthenticationPrincipal Jwt jwt) {
        Project p = projectService.getOwned(id, resolveUser(jwt));
        subscriberService.deleteSubscriber(subId, p);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/subscribers/{subId}/resend")
    @Operation(summary = "Resend confirmation email to unconfirmed subscriber")
    public ResponseEntity<Void> resendConfirmation(@PathVariable Long id,
                                                    @PathVariable Long subId,
                                                    @AuthenticationPrincipal Jwt jwt) {
        Project p = projectService.getOwned(id, resolveUser(jwt));
        subscriberService.resendConfirmation(subId, p);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/analytics/trend")
    @Operation(summary = "Daily funnel trend", description = "Last N days (default 7). Returns daily {date, views, subscribed, confirmed}.")
    public ResponseEntity<java.util.List<uz.uzlaunch.service.AnalyticsService.DailyPoint>> trend(
            @PathVariable Long id,
            @RequestParam(defaultValue = "7") int days,
            @AuthenticationPrincipal Jwt jwt) {
        User user = resolveUser(jwt);
        Project p = projectService.getOwned(id, user);
        int safeDays = Math.max(1, Math.min(days, 30));
        return ResponseEntity.ok(analyticsService.computeTrend(p, safeDays));
    }

    @GetMapping("/{id}/feedback")
    @Operation(summary = "Confirmed subscribers with feedback answers", description = "PRO plan only.")
    public ResponseEntity<java.util.List<uz.uzlaunch.api.dto.response.SubscriberResponse>> feedback(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        User user = resolveUser(jwt);
        if (user.getPlan() != uz.uzlaunch.model.User.Plan.PAID)
            throw new uz.uzlaunch.exception.ForbiddenException("Feedback analytics requires Pro plan");
        java.util.List<uz.uzlaunch.api.dto.response.SubscriberResponse> answers =
            projectService.getExportData(id, user).subscribers().stream()
                .filter(s -> s.getFeedbackAnswer() != null && !s.getFeedbackAnswer().isBlank())
                .map(uz.uzlaunch.api.dto.response.SubscriberResponse::from)
                .toList();
        return ResponseEntity.ok(answers);
    }
}