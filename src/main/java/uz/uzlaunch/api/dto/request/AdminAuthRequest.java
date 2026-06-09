package uz.uzlaunch.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AdminAuthRequest(
        @NotBlank(message = "Secret is required")
        String secret
) {}