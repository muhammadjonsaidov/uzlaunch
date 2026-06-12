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
import uz.uzlaunch.api.dto.request.WebhookApiRequest;
import uz.uzlaunch.api.dto.response.PagedResponse;
import uz.uzlaunch.api.dto.response.WebhookDeliveryResponse;
import uz.uzlaunch.api.dto.response.WebhookResponse;
import uz.uzlaunch.exception.PageNotFoundException;
import uz.uzlaunch.model.User;
import uz.uzlaunch.model.Webhook;
import uz.uzlaunch.repository.UserRepository;
import uz.uzlaunch.service.WebhookService;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/webhooks")
@SecurityRequirement(name = "Bearer")
@Tag(name = "Webhooks", description = "Webhook configs and delivery history (PRO plan)")
@RequiredArgsConstructor
public class WebhookApiController {

    private final WebhookService webhookService;
    private final UserRepository userRepo;

    private User resolveUser(Jwt jwt) {
        return userRepo.findById(jwt.getSubject()).orElseThrow(PageNotFoundException::new);
    }

    @GetMapping
    @Operation(summary = "List webhooks for project")
    public ResponseEntity<List<WebhookResponse>> list(@PathVariable Long projectId, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(
            webhookService.list(projectId, resolveUser(jwt)).stream()
                .map(w -> WebhookResponse.from(w, false)).toList()
        );
    }

    @PostMapping
    @Operation(summary = "Create webhook (returns secret in plaintext, only this once)")
    public ResponseEntity<WebhookResponse> create(@PathVariable Long projectId,
                                                   @Valid @RequestBody WebhookApiRequest req,
                                                   @AuthenticationPrincipal Jwt jwt) {
        Webhook w = webhookService.create(projectId, resolveUser(jwt), req.url(), req.events(),
                Boolean.TRUE.equals(req.useSecret()));
        return ResponseEntity.status(HttpStatus.CREATED).body(WebhookResponse.from(w, true));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update webhook (rotate secret optional)")
    public ResponseEntity<WebhookResponse> update(@PathVariable Long projectId, @PathVariable Long id,
                                                   @Valid @RequestBody WebhookApiRequest req,
                                                   @AuthenticationPrincipal Jwt jwt) {
        Webhook w = webhookService.update(id, projectId, resolveUser(jwt),
                req.url(), req.events(), req.active(), req.rotateSecret());
        boolean reveal = Boolean.TRUE.equals(req.rotateSecret());
        return ResponseEntity.ok(WebhookResponse.from(w, reveal));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete webhook and its delivery history")
    public ResponseEntity<Void> delete(@PathVariable Long projectId, @PathVariable Long id,
                                        @AuthenticationPrincipal Jwt jwt) {
        webhookService.delete(id, projectId, resolveUser(jwt));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/test")
    @Operation(summary = "Send a test ping to the webhook URL")
    public ResponseEntity<WebhookDeliveryResponse> test(@PathVariable Long projectId, @PathVariable Long id,
                                                         @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(WebhookDeliveryResponse.from(
            webhookService.test(id, projectId, resolveUser(jwt))
        ));
    }

    @GetMapping("/{id}/deliveries")
    @Operation(summary = "Webhook delivery history (paginated)")
    public ResponseEntity<PagedResponse<WebhookDeliveryResponse>> deliveries(@PathVariable Long projectId,
                                                                              @PathVariable Long id,
                                                                              @RequestParam(defaultValue = "0") int page,
                                                                              @AuthenticationPrincipal Jwt jwt) {
        var p = webhookService.deliveries(id, projectId, resolveUser(jwt), page);
        return ResponseEntity.ok(new PagedResponse<>(
            p.getContent().stream().map(WebhookDeliveryResponse::from).toList(),
            p.getNumber(), p.getTotalPages(), p.getTotalElements()
        ));
    }
}
