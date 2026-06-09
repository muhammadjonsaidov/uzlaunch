package uz.uzlaunch.api.dto.response;

import uz.uzlaunch.model.User;

import java.time.ZoneOffset;

public record UserResponse(String id, String email, String name, String plan, String createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPlan().name(),
                user.getCreatedAt().toInstant(ZoneOffset.UTC).toString()
        );
    }
}