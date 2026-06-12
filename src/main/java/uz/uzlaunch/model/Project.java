package uz.uzlaunch.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Getter
@Setter
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(nullable = false)
    private String name;

    private String tagline;

    @Column(length = 1000)
    private String description;

    @Column(length = 500)
    private String logoUrl;

    @Column(length = 7)
    private String accentColor;

    private LocalDateTime launchAt;
    private boolean launchNotified = false;
    private String launchEmailSubject;

    @Column(length = 2000)
    private String launchEmailBody;

    private String confirmEmailSubject;

    @Column(length = 2000)
    private String confirmEmailBody;

    private int subscriberCount = 0;
    private int validationScore = 0;
    private String feedbackQuestion;
    private LocalDateTime createdAt = LocalDateTime.now();
}
