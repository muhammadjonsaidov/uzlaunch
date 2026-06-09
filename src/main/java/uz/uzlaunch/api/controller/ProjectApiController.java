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
public class ProjectApiController {

    @Autowired private ProjectService projectService;
    @Autowired private SubscriberService subscriberService;
    @Autowired private UserRepository userRepo;

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

    @GetMapping("/{id}")
    @Operation(summary = "Project detail with paginated confirmed subscribers", description = "?page=0&q=search")
    public ResponseEntity<ProjectDetailResponse> detail(@PathVariable Long id,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(required = false) String q,
                                                         @AuthenticationPrincipal Jwt jwt) {
        User user = resolveUser(jwt);
        ProjectService.ProjectDetail detail = projectService.getProjectDetail(id, user, page, q);
        return ResponseEntity.ok(new ProjectDetailResponse(
                ProjectResponse.from(detail.project()),
                new PagedResponse<>(
                        detail.subscribers().stream().map(SubscriberResponse::from).toList(),
                        detail.page(), detail.totalPages(), detail.total()
                ),
                detail.pending().size(),
                detail.locked()
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
}