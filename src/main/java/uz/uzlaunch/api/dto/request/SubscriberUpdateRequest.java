package uz.uzlaunch.api.dto.request;

import jakarta.validation.constraints.Size;

public record SubscriberUpdateRequest(
        @Size(max = 100, message = "Name must be under 100 characters")
        String name,
        String commitment
) {}
