package uz.uzlaunch.api.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import uz.uzlaunch.api.dto.response.PagedResponse;
import uz.uzlaunch.api.dto.response.ProjectResponse;
import uz.uzlaunch.api.dto.response.SubscriberResponse;
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
public class ProjectApiController {

    @Autowired private ProjectService projectService;
    @Autowired private SubscriberService subscriberService;
    @Autowired private UserRepository userRepo;

    private User resolveUser(Jwt jwt) {
        return userRepo.findById(jwt.getSubject()).orElseThrow(PageNotFoundException::new);
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> list(@AuthenticationPrincipal Jwt jwt) {
        User user = resolveUser(jwt);
        return ResponseEntity.ok(
                projectService.listByUser(user).stream().map(ProjectResponse::from).toList()
        );
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectCreateRequest req,
                                                   @AuthenticationPrincipal Jwt jwt) {
        User user = resolveUser(jwt);
        Project p = projectService.create(req, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ProjectResponse.from(p));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> detail(@PathVariable Long id,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(required = false) String q,
                                                       @AuthenticationPrincipal Jwt jwt) {
        User user = resolveUser(jwt);
        ProjectService.ProjectDetail detail = projectService.getProjectDetail(id, user, page, q);
        List<SubscriberResponse> subscribers = detail.subscribers().stream()
                .map(SubscriberResponse::from).toList();
        PagedResponse<SubscriberResponse> paged = new PagedResponse<>(
                subscribers, detail.page(), detail.totalPages(), detail.total()
        );
        return ResponseEntity.ok(Map.of(
                "project", ProjectResponse.from(detail.project()),
                "subscribers", paged,
                "pendingCount", detail.pending().size(),
                "locked", detail.locked()
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody ProjectCreateRequest req,
                                                   @AuthenticationPrincipal Jwt jwt) {
        User user = resolveUser(jwt);
        Project p = projectService.update(id, req, user);
        return ResponseEntity.ok(ProjectResponse.from(p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        User user = resolveUser(jwt);
        projectService.delete(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<List<SubscriberResponse>> export(@PathVariable Long id,
                                                            @AuthenticationPrincipal Jwt jwt) {
        User user = resolveUser(jwt);
        ProjectService.ExportData data = projectService.getExportData(id, user);
        return ResponseEntity.ok(data.subscribers().stream().map(SubscriberResponse::from).toList());
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> stats(@PathVariable Long id,
                                                      @AuthenticationPrincipal Jwt jwt) {
        User user = resolveUser(jwt);
        Project p = projectService.getOwned(id, user);
        Map<String, Object> stats = projectService.getStats(p.getSlug(), user);
        stats.put("project", ProjectResponse.from(p));
        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/{id}/subscribers/{subId}")
    public ResponseEntity<Void> deleteSubscriber(@PathVariable Long id,
                                                  @PathVariable Long subId,
                                                  @AuthenticationPrincipal Jwt jwt) {
        User user = resolveUser(jwt);
        Project p = projectService.getOwned(id, user);
        subscriberService.deleteSubscriber(subId, p);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/subscribers/{subId}/resend")
    public ResponseEntity<Void> resendConfirmation(@PathVariable Long id,
                                                    @PathVariable Long subId,
                                                    @AuthenticationPrincipal Jwt jwt) {
        User user = resolveUser(jwt);
        Project p = projectService.getOwned(id, user);
        subscriberService.resendConfirmation(subId, p);
        return ResponseEntity.noContent().build();
    }
}