package uz.uzlaunch.dto;

import jakarta.validation.constraints.*;

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

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLaunchAt() { return launchAt; }
    public void setLaunchAt(String launchAt) { this.launchAt = launchAt; }
    public String getLaunchEmailSubject() { return launchEmailSubject; }
    public void setLaunchEmailSubject(String launchEmailSubject) { this.launchEmailSubject = launchEmailSubject; }
    public String getLaunchEmailBody() { return launchEmailBody; }
    public void setLaunchEmailBody(String launchEmailBody) { this.launchEmailBody = launchEmailBody; }
}
