package uz.uzlaunch.api.dto.response;

import uz.uzlaunch.model.Webhook;

import java.time.ZoneOffset;

public record WebhookResponse(
        Long id,
        String url,
        String events,
        String secret,
        boolean active,
        int failureCount,
        String lastAttemptAt,
        Integer lastStatus,
        String createdAt
) {
    public static WebhookResponse from(Webhook w, boolean revealSecret) {
        return new WebhookResponse(
                w.getId(),
                w.getUrl(),
                w.getEvents(),
                revealSecret ? w.getSecret() : (w.getSecret() != null ? "***" : null),
                w.isActive(),
                w.getFailureCount(),
                w.getLastAttemptAt() != null ? w.getLastAttemptAt().toInstant(ZoneOffset.UTC).toString() : null,
                w.getLastStatus(),
                w.getCreatedAt().toInstant(ZoneOffset.UTC).toString()
        );
    }
}
