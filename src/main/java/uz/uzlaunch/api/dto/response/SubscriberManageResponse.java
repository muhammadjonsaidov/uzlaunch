package uz.uzlaunch.api.dto.response;

public record SubscriberManageResponse(
        String email,
        String name,
        String commitment,
        boolean confirmed,
        long position,
        long totalConfirmed,
        String referralCode,
        ProjectInfo project
) {
    public record ProjectInfo(String slug, String name, String tagline, String logoUrl, String accentColor, String launchAt) {}
}
