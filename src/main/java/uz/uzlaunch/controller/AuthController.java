package uz.uzlaunch.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import uz.uzlaunch.dto.LoginRequest;
import uz.uzlaunch.dto.RegisterRequest;
import uz.uzlaunch.model.User;
import uz.uzlaunch.service.AuthService;

@Controller
public class AuthController {

    @Autowired private AuthService authService;

    @GetMapping("/")
    public String home(HttpSession session) {
        if (authService.getSessionUser(session) != null) return "redirect:/dashboard";
        return "index";
    }

    @GetMapping("/register")
    public String registerPage() { return "register"; }

    @PostMapping("/register")
    public String register(@Valid @ModelAttribute RegisterRequest req,
                           BindingResult errors,
                           HttpSession session,
                           RedirectAttributes ra) {
        if (errors.hasErrors()) {
            ra.addFlashAttribute("error", errors.getAllErrors().get(0).getDefaultMessage());
            return "redirect:/register";
        }
        User user = authService.register(req);
        session.setAttribute("userId", user.getId());
        return "redirect:/dashboard";
    }

    @GetMapping("/login")
    public String loginPage() { return "login"; }

    @PostMapping("/login")
    public String login(@Valid @ModelAttribute LoginRequest req,
                        BindingResult errors,
                        HttpSession session,
                        RedirectAttributes ra) {
        if (errors.hasErrors()) {
            ra.addFlashAttribute("error", errors.getAllErrors().get(0).getDefaultMessage());
            return "redirect:/login";
        }
        User user = authService.login(req);
        session.setAttribute("userId", user.getId());
        return "redirect:/dashboard";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }
}
