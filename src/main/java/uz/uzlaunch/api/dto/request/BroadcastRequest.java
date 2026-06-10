package uz.uzlaunch.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record BroadcastRequest(@NotBlank String subject, @NotBlank String body) {}
