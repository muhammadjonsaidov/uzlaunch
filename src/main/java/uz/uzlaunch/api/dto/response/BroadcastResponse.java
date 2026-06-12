package uz.uzlaunch.api.dto.response;

import uz.uzlaunch.model.Broadcast;

import java.time.ZoneOffset;

public record BroadcastResponse(
        Long id,
        String subject,
        String body,
        String sentAt,
        int recipientCount
) {
    public static BroadcastResponse from(Broadcast b) {
        return new BroadcastResponse(
                b.getId(),
                b.getSubject(),
                b.getBody(),
                b.getSentAt().toInstant(ZoneOffset.UTC).toString(),
                b.getRecipientCount()
        );
    }
}
