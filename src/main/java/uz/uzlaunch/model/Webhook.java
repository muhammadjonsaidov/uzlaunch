package uz.uzlaunch.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "webhooks")
@Getter
@Setter
public class Webhook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(nullable = false, length = 255)
    private String events = "subscriber.created,subscriber.confirmed";

    @Column(length = 128)
    private String secret;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "failure_count", nullable = false)
    private int failureCount = 0;

    @Column(name = "last_attempt_at")
    private LocalDateTime lastAttemptAt;

    @Column(name = "last_status")
    private Integer lastStatus;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public static final String EVT_SUB_CREATED = "subscriber.created";
    public static final String EVT_SUB_CONFIRMED = "subscriber.confirmed";
    public static final String EVT_SUB_UNSUBSCRIBED = "subscriber.unsubscribed";
    public static final String EVT_BROADCAST_SENT = "broadcast.sent";

    public boolean handles(String eventType) {
        if (events == null) return false;
        for (String e : events.split(",")) {
            if (e.trim().equals(eventType)) return true;
        }
        return false;
    }
}
