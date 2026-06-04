package uz.uzlaunch.service;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import uz.uzlaunch.dto.LoginRequest;
import uz.uzlaunch.dto.RegisterRequest;
import uz.uzlaunch.exception.InvalidCredentialsException;
import uz.uzlaunch.exception.UserAlreadyExistsException;
import uz.uzlaunch.model.User;
import uz.uzlaunch.repository.UserRepository;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder encoder;

    public User register(RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (userRepo.existsByEmail(email)) throw new UserAlreadyExistsException();

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setName(req.getName().trim());
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(req.getPassword()));
        return userRepo.save(user);
    }

    public User login(LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        Optional<User> opt = userRepo.findByEmail(email);
        if (opt.isEmpty() || !encoder.matches(req.getPassword(), opt.get().getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        return opt.get();
    }

    public User getSessionUser(HttpSession session) {
        String id = (String) session.getAttribute("userId");
        if (id == null) return null;
        return userRepo.findById(id).orElse(null);
    }
}
