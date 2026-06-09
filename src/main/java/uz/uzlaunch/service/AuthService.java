package uz.uzlaunch.service;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import uz.uzlaunch.dto.LoginRequest;
import uz.uzlaunch.dto.RegisterRequest;
import uz.uzlaunch.exception.*;
import uz.uzlaunch.model.User;
import uz.uzlaunch.repository.UserRepository;

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
        user.setEmailVerified(false);
        user.setVerificationToken(UUID.randomUUID().toString());
        userRepo.save(user);

        emailService.sendVerificationEmail(email, user.getName(), user.getVerificationToken());
        return user;
    }

    public User login(LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        var opt = userRepo.findByEmail(email);
        if (opt.isEmpty() || !encoder.matches(req.getPassword(), opt.get().getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        User user = opt.get();
        if (user.isBanned()) throw new BannedUserException();
        if (!user.isEmailVerified()) throw new EmailNotVerifiedException();
        return user;
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
