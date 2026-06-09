package uz.uzlaunch.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SubscribeRequest {

    @NotBlank(message = "Please enter a valid email address")
    @Email(message = "Please enter a valid email address")
    private String email;

    private String name;
}
