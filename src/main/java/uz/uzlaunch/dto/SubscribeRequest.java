package uz.uzlaunch.dto;

import jakarta.validation.constraints.*;

public class SubscribeRequest {

    @NotBlank(message = "Please enter a valid email address")
    @Email(message = "Please enter a valid email address")
    private String email;

    private String name;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
