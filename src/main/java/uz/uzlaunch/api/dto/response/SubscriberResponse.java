package uz.uzlaunch.api.dto.response;

import uz.uzlaunch.model.Subscriber;

import java.time.ZoneOffset;

public record SubscriberResponse(
        Long id,
        String email,
        String name,
        boolean confirmed,
        String subscribedAt,
        String confirmedAt
) {
    public static SubscriberResponse from(Subscriber s) {
        return new SubscriberResponse(
                s.getId(),
                s.getEmail(),
                s.getName(),
                s.isConfirmed(),
                s.getSubscribedAt().toInstant(ZoneOffset.UTC).toString(),
                s.getConfirmedAt() != null ? s.getConfirmedAt().toInstant(ZoneOffset.UTC).toString() : null
        );
    }
}