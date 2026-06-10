package uz.uzlaunch.api.dto.response;

import java.util.List;

public record ProjectDetailResponse(
        ProjectResponse project,
        PagedResponse<SubscriberResponse> subscribers,
        int pendingCount,
        boolean locked,
        List<SubscriberResponse> pendingSubscribers
) {}