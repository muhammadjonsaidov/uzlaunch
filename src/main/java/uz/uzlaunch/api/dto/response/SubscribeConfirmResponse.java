package uz.uzlaunch.api.dto.response;

public record SubscribeConfirmResponse(String message, String projectSlug, long position, long total) {}