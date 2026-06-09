package uz.uzlaunch.api.dto.response;

import java.util.List;

public record AdminStatsResponse(
        long userCount,
        long projectCount,
        long subscriberCount,
        long todaySignups,
        List<UserResponse> users,
        List<ProjectResponse> projects,
        List<DailyCountResponse> dailySignups
) {}