package uz.uzlaunch.api.dto.request;

import jakarta.validation.constraints.*;

public record SubscribeApiRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address")
        String email,

        String name
) {}