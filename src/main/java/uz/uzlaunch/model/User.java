package uz.uzlaunch.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    private String name;

    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Plan plan = Plan.FREE;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Plan { FREE, PAID }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public Plan getPlan() { return plan; }
    public void setPlan(Plan plan) { this.plan = plan; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
