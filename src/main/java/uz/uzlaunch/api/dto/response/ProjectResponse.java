package uz.uzlaunch.api.dto.response;

import uz.uzlaunch.model.Project;

import java.time.ZoneOffset;

public record ProjectResponse(
        Long id,
        String slug,
        String name,
        String tagline,
        String description,
        int subscriberCount,
        int validationScore,
        String feedbackQuestion,
        String launchAt,
        String createdAt,
        String userEmail
) {
    public static ProjectResponse from(Project p) {
        return new ProjectResponse(
                p.getId(),
                p.getSlug(),
                p.getName(),
                p.getTagline(),
                p.getDescription(),
                p.getSubscriberCount(),
                p.getValidationScore(),
                p.getFeedbackQuestion(),
                p.getLaunchAt() != null ? p.getLaunchAt().toInstant(ZoneOffset.UTC).toString() : null,
                p.getCreatedAt().toInstant(ZoneOffset.UTC).toString(),
                p.getUser() != null ? p.getUser().getEmail() : null
        );
    }
}