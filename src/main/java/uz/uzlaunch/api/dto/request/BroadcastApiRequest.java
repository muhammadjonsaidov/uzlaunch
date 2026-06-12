package uz.uzlaunch.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BroadcastApiRequest(
        @NotBlank(message = "Subject is required")
        @Size(max = 200, message = "Subject must be under 200 characters")
        String subject,

        @NotBlank(message = "Body is required")
        @Size(max = 10000, message = "Body must be under 10000 characters")
        String body
) {}
