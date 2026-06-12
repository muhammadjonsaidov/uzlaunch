package uz.uzlaunch.api.dto.response;

import uz.uzlaunch.model.WebhookDelivery;

import java.time.ZoneOffset;

public record WebhookDeliveryResponse(
        Long id,
        String eventType,
        String payload,
        Integer statusCode,
        String responseBody,
        String error,
        int attemptCount,
        String deliveredAt
) {
    public static WebhookDeliveryResponse from(WebhookDelivery d) {
        return new WebhookDeliveryResponse(
                d.getId(),
                d.getEventType(),
                d.getPayload(),
                d.getStatusCode(),
                d.getResponseBody(),
                d.getError(),
                d.getAttemptCount(),
                d.getDeliveredAt().toInstant(ZoneOffset.UTC).toString()
        );
    }
}
