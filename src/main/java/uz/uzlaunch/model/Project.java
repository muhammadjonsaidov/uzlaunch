package uz.uzlaunch.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(unique = true, nullable = false)
    private String slug;          // e.g. "my-startup"

    @Column(nullable = false)
    private String name;

    private String tagline;

    @Column(length = 1000)
    private String description;

    private String logoUrl;

    private LocalDateTime launchAt;

    private boolean launchNotified = false;

    private String launchEmailSubject;

    @Column(length = 2000)
    private String launchEmailBody;

    private int subscriberCount = 0;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters & Setters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public LocalDateTime getLaunchAt() { return launchAt; }
    public void setLaunchAt(LocalDateTime launchAt) { this.launchAt = launchAt; }
    public boolean isLaunchNotified() { return launchNotified; }
    public void setLaunchNotified(boolean launchNotified) { this.launchNotified = launchNotified; }
    public String getLaunchEmailSubject() { return launchEmailSubject; }
    public void setLaunchEmailSubject(String launchEmailSubject) { this.launchEmailSubject = launchEmailSubject; }
    public String getLaunchEmailBody() { return launchEmailBody; }
    public void setLaunchEmailBody(String launchEmailBody) { this.launchEmailBody = launchEmailBody; }
    public int getSubscriberCount() { return subscriberCount; }
    public void setSubscriberCount(int subscriberCount) { this.subscriberCount = subscriberCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
