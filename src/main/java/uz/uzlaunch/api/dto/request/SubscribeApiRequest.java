package uz.uzlaunch.api.dto.request;

import jakarta.validation.constraints.*;

public record SubscribeApiRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address")
        String email,

        String name,

        String commitment,

        @Size(max = 1000, message = "Feedback answer must be under 1000 characters")
        String feedbackAnswer,

        String ref
) {}