package uz.uzlaunch.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "subscribers")
@Getter
@Setter
public class Subscriber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private String email;

    private String name;
    private String token;
    private boolean confirmed = false;
    private LocalDateTime subscribedAt = LocalDateTime.now();
    private LocalDateTime confirmedAt;

    @Enumerated(EnumType.STRING)
    private Commitment commitment = Commitment.WOULD_USE;

    @Column(length = 1000)
    private String feedbackAnswer;

    @Column(name = "referral_code", unique = true, length = 16)
    private String referralCode;

    @Column(name = "referred_by_id")
    private Long referredById;

    @Column(name = "referral_count", nullable = false)
    private int referralCount = 0;

    @Column(name = "utm_source", length = 100)
    private String utmSource;

    @Column(name = "utm_medium", length = 100)
    private String utmMedium;

    @Column(name = "utm_campaign", length = 100)
    private String utmCampaign;

    public enum Commitment { WOULD_USE, WOULD_PAY, PAY_NOW }
}
