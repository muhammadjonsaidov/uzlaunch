package uz.uzlaunch.api.dto.request;

import jakarta.validation.constraints.Size;

public record WebhookApiRequest(
        @Size(max = 500, message = "URL must be under 500 characters")
        String url,
        String events,
        Boolean useSecret,
        Boolean rotateSecret,
        Boolean active
) {}
