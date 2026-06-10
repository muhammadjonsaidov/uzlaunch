package uz.uzlaunch.api.dto.response;

import java.util.List;
import java.util.Map;

public record AdminStatsResponse(
        long userCount,
        long projectCount,
        long subscriberCount,
        long todaySignups,
        List<UserResponse> users,
        List<ProjectResponse> projects,
        List<DailyCountResponse> dailySignups,
        List<ProjectResponse> topProjects,
        Map<Long, Long> pendingByProject,
        List<PendingSubscriberResponse> pendingSubscribers
) {}
