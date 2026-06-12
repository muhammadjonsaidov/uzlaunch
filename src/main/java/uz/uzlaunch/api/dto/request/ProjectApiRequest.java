package uz.uzlaunch.api.dto.request;

import jakarta.validation.constraints.*;

public record ProjectApiRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be under 100 characters")
        String name,

        @NotBlank(message = "Tagline is required")
        @Size(max = 150, message = "Tagline must be under 150 characters")
        String tagline,

        @Size(max = 1000, message = "Description must be under 1000 characters")
        String description,

        String launchAt,

        @Size(max = 200, message = "Launch email subject must be under 200 characters")
        String launchEmailSubject,

        @Size(max = 2000, message = "Launch email body must be under 2000 characters")
        String launchEmailBody,

        @Size(max = 200, message = "Confirm email subject must be under 200 characters")
        String confirmEmailSubject,

        @Size(max = 2000, message = "Confirm email body must be under 2000 characters")
        String confirmEmailBody,

        @Size(max = 255, message = "Feedback question must be under 255 characters")
        String feedbackQuestion,

        @Size(max = 500, message = "Logo URL must be under 500 characters")
        String logoUrl,

        @Pattern(regexp = "^(#[0-9a-fA-F]{6})?$", message = "Accent color must be a hex code like #6366f1")
        String accentColor,

        Boolean isPublic
) {}