package uz.uzlaunch.api.dto.request;

import jakarta.validation.constraints.*;

public record RegisterApiRequest(
        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        @Pattern(regexp = ".*\\d.*", message = "Password must contain at least one number")
        String password
) {}