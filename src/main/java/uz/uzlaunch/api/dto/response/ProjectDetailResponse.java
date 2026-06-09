package uz.uzlaunch.api.dto.response;

public record ProjectDetailResponse(
        ProjectResponse project,
        PagedResponse<SubscriberResponse> subscribers,
        int pendingCount,
        boolean locked
) {}