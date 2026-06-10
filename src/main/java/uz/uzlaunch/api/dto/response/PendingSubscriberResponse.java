package uz.uzlaunch.api.dto.response;

import uz.uzlaunch.model.Subscriber;
import java.time.ZoneOffset;

public record PendingSubscriberResponse(Long id, String email, String name, String projectName, String projectSlug, String subscribedAt) {
    public static PendingSubscriberResponse from(Subscriber s) {
        return new PendingSubscriberResponse(
                s.getId(),
                s.getEmail(),
                s.getName(),
                s.getProject().getName(),
                s.getProject().getSlug(),
                s.getSubscribedAt().toInstant(ZoneOffset.UTC).toString()
        );
    }
}
