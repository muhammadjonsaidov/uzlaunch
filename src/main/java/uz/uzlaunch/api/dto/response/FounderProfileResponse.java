package uz.uzlaunch.api.dto.response;

import java.util.List;

public record FounderProfileResponse(
        String username,
        String name,
        String bio,
        String avatarUrl,
        String twitter,
        String github,
        String linkedin,
        String website,
        String memberSince,
        int projectCount,
        long totalSubscribers,
        List<ProjectResponse> projects
) {}
