package uz.uzlaunch.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProjectCreateRequest {

    @NotBlank(message = "Project name is required")
    @Size(max = 100, message = "Name must be under 100 characters")
    private String name;

    @NotBlank(message = "Tagline is required")
    @Size(max = 150, message = "Tagline must be under 150 characters")
    private String tagline;

    @Size(max = 1000, message = "Description must be under 1000 characters")
    private String description;

    private String launchAt;

    @Size(max = 200, message = "Email subject must be under 200 characters")
    private String launchEmailSubject;

    @Size(max = 2000, message = "Email body must be under 2000 characters")
    private String launchEmailBody;

    @Size(max = 200, message = "Confirmation email subject must be under 200 characters")
    private String confirmEmailSubject;

    @Size(max = 2000, message = "Confirmation email body must be under 2000 characters")
    private String confirmEmailBody;
}
