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
}
