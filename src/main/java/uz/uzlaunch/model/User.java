package uz.uzlaunch.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    private String name;
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Plan plan = Plan.FREE;

    private boolean banned = false;
    private boolean emailVerified = false;
    private String verificationToken;
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Plan { FREE, PAID }
}
