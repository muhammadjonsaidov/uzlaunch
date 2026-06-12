package uz.uzlaunch.service;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.uzlaunch.dto.LoginRequest;
import uz.uzlaunch.dto.RegisterRequest;
import uz.uzlaunch.exception.*;
import uz.uzlaunch.model.User;
import uz.uzlaunch.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final EmailService emailService;

    public User register(RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (userRepo.existsByEmail(email)) throw new UserAlreadyExistsException();

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setName(req.getName().trim());
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setAuthProvider(User.AuthProvider.LOCAL);
        user.setEmailVerified(false);
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setUsername(generateUsername(req.getName(), email));
        userRepo.save(user);

        emailService.sendVerificationEmail(email, user.getName(), user.getVerificationToken());
        return user;
    }

    public User updateProfile(String userId, uz.uzlaunch.api.dto.request.ProfileUpdateRequest req) {
        User user = userRepo.findById(userId).orElseThrow(() -> new uz.uzlaunch.exception.PageNotFoundException());
        if (req.name() != null && !req.name().isBlank()) user.setName(req.name().trim());
        if (req.username() != null && !req.username().isBlank()) {
            String newUsername = req.username().trim().toLowerCase();
            if (!newUsername.equals(user.getUsername())) {
                if (userRepo.existsByUsername(newUsername))
                    throw new uz.uzlaunch.exception.BadRequestException("Username already taken");
                user.setUsername(newUsername);
            }
        }
        user.setBio(blankToNull(req.bio()));
        user.setAvatarUrl(blankToNull(req.avatarUrl()));
        user.setTwitter(stripHandle(req.twitter()));
        user.setGithub(stripHandle(req.github()));
        user.setLinkedin(stripHandle(req.linkedin()));
        user.setWebsite(blankToNull(req.website()));
        return userRepo.save(user);
    }

    private static String blankToNull(String s) {
        return (s == null || s.trim().isEmpty()) ? null : s.trim();
    }

    private static String stripHandle(String s) {
        if (s == null) return null;
        String t = s.trim();
        if (t.isEmpty()) return null;
        if (t.startsWith("@")) t = t.substring(1);
        return t;
    }

    public String generateUsername(String name, String email) {
        String base;
        if (name != null && !name.isBlank()) {
            base = name.toLowerCase().trim().replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
        } else {
            String localPart = email.contains("@") ? email.substring(0, email.indexOf("@")) : email;
            base = localPart.toLowerCase().replaceAll("[^a-z0-9]+", "");
        }
        if (base.isEmpty()) base = "founder";
        if (base.length() > 24) base = base.substring(0, 24);

        String candidate = base;
        int i = 1;
        while (userRepo.existsByUsername(candidate)) {
            i++;
            candidate = base + "-" + i;
            if (candidate.length() > 32) candidate = base.substring(0, 30 - String.valueOf(i).length()) + "-" + i;
        }
        return candidate;
    }

    public User login(LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        var opt = userRepo.findByEmail(email);
        if (opt.isEmpty() || !encoder.matches(req.getPassword(), opt.get().getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        User user = opt.get();
        if (user.isBanned()) throw new BannedUserException();
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new ForbiddenException("no_password_set");
        }
        if (!user.isEmailVerified()) throw new EmailNotVerifiedException();
        return user;
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepo.findByEmail(email.trim().toLowerCase()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepo.save(user);
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepo.findByResetToken(token)
            .orElseThrow(() -> new PageNotFoundException());
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ForbiddenException("Reset link expired. Request a new one.");
        }
        user.setPasswordHash(encoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setEmailVerified(true);
        userRepo.save(user);
    }

    public User getSessionUser(HttpSession session) {
        String id = (String) session.getAttribute("userId");
        if (id == null) return null;
        return userRepo.findById(id).orElse(null);
    }

    public User verifyEmail(String token) {
        User user = userRepo.findByVerificationToken(token)
            .orElseThrow(PageNotFoundException::new);
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        return userRepo.save(user);
    }
}
