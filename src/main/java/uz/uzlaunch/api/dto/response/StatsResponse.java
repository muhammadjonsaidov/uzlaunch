package uz.uzlaunch.api.dto.response;

import java.util.List;

public record StatsResponse(
        ProjectResponse project,
        List<ChartBar> chartData,
        long totalSubscribers,
        int statsDays,
        long last7Days
) {}