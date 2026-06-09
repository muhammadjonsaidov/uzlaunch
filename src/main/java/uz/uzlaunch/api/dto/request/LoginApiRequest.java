package uz.uzlaunch.api.dto.request;

import jakarta.validation.constraints.*;

public record LoginApiRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address")
        String email,

        @NotBlank(message = "Password is required")
        String password
) {}