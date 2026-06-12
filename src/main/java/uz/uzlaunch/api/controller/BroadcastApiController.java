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
import uz.uzlaunch.api.dto.request.BroadcastApiRequest;
import uz.uzlaunch.api.dto.response.BroadcastResponse;
import uz.uzlaunch.exception.PageNotFoundException;
import uz.uzlaunch.model.Broadcast;
import uz.uzlaunch.model.User;
import uz.uzlaunch.repository.UserRepository;
import uz.uzlaunch.service.BroadcastService;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/broadcasts")
@SecurityRequirement(name = "Bearer")
@Tag(name = "Broadcasts", description = "Send email updates to confirmed subscribers (PRO plan only)")
@RequiredArgsConstructor
public class BroadcastApiController {

    private final BroadcastService broadcastService;
    private final UserRepository userRepo;

    private User resolveUser(Jwt jwt) {
        return userRepo.findById(jwt.getSubject()).orElseThrow(PageNotFoundException::new);
    }

    @GetMapping
    @Operation(summary = "List past broadcasts for a project")
    public ResponseEntity<List<BroadcastResponse>> list(@PathVariable Long projectId,
                                                         @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(
            broadcastService.list(projectId, resolveUser(jwt)).stream().map(BroadcastResponse::from).toList()
        );
    }

    @PostMapping
    @Operation(summary = "Send a broadcast email to all confirmed subscribers",
               description = "PRO plan only. Rate limited: 5 per project per day. Supports {{name}} personalization.")
    public ResponseEntity<BroadcastResponse> send(@PathVariable Long projectId,
                                                   @Valid @RequestBody BroadcastApiRequest req,
                                                   @AuthenticationPrincipal Jwt jwt) {
        Broadcast b = broadcastService.send(projectId, resolveUser(jwt), req.subject(), req.body());
        return ResponseEntity.status(HttpStatus.CREATED).body(BroadcastResponse.from(b));
    }
}
