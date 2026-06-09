package uz.uzlaunch.api.dto.response;

public record AuthResponse(String token, UserResponse user) {}