package uz.uzlaunch.api.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @Size(max = 100, message = "Name must be under 100 characters")
        String name,

        @Pattern(regexp = "^[a-z0-9]([a-z0-9-]{0,30}[a-z0-9])?$",
                 message = "Username must be 1-32 chars: lowercase letters, digits, hyphens (not at start/end)")
        String username,

        @Size(max = 300, message = "Bio must be under 300 characters")
        String bio,

        @Size(max = 500, message = "Avatar URL must be under 500 characters")
        String avatarUrl,

        @Size(max = 100, message = "Twitter handle must be under 100 characters")
        String twitter,

        @Size(max = 100, message = "GitHub handle must be under 100 characters")
        String github,

        @Size(max = 100, message = "LinkedIn handle must be under 100 characters")
        String linkedin,

        @Size(max = 200, message = "Website URL must be under 200 characters")
        String website
) {}
