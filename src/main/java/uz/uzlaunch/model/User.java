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

    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider = AuthProvider.LOCAL;

    private boolean banned = false;
    private boolean emailVerified = false;
    private String verificationToken;
    private String resetToken;
    private LocalDateTime resetTokenExpiry;
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(unique = true, length = 32)
    private String username;

    @Column(length = 300)
    private String bio;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(length = 100)
    private String twitter;

    @Column(length = 100)
    private String github;

    @Column(length = 100)
    private String linkedin;

    @Column(length = 200)
    private String website;

    public enum Plan { FREE, PAID }
    public enum AuthProvider { LOCAL, GOOGLE, GITHUB }
}
