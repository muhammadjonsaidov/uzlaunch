package uz.uzlaunch.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import uz.uzlaunch.dto.SubscribeRequest;
import uz.uzlaunch.model.User;
import uz.uzlaunch.service.AuthService;
import uz.uzlaunch.service.ProjectService;
import uz.uzlaunch.service.SubscriberService;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class PublicController {

    private final AuthService authService;
    private final ProjectService projectService;
    private final SubscriberService subscriberService;

    @Value("${app.trust-proxy:false}")
    private final boolean trustProxy;

    @GetMapping("/p/{slug}")
    public String publicPage(@PathVariable String slug, Model model) {
        model.addAttribute("project", projectService.getBySlug(slug));
        return "project-public";
    }

    @PostMapping("/p/{slug}/subscribe")
    public String subscribe(@PathVariable String slug,
                            @Valid @ModelAttribute SubscribeRequest req,
                            BindingResult errors,
                            HttpServletRequest request,
                            RedirectAttributes ra) {
        if (errors.hasErrors()) {
            ra.addFlashAttribute("message", errors.getAllErrors().get(0).getDefaultMessage());
            return "redirect:/p/" + slug;
        }
        subscriberService.subscribe(slug, req, getClientIp(request));
        ra.addFlashAttribute("message", "Check your email to confirm your spot on the waitlist!");
        return "redirect:/p/" + slug;
    }

    @GetMapping("/p/{slug}/confirm")
    public String confirmSubscription(@PathVariable String slug,
                                      @RequestParam String token,
                                      RedirectAttributes ra) {
        subscriberService.confirmSubscription(token);
        ra.addFlashAttribute("message", "Email confirmed! You're officially on the waitlist.");
        return "redirect:/p/" + slug;
    }

    @GetMapping("/unsubscribe")
    public String unsubscribe(@RequestParam String token, Model model) {
        String projectName = subscriberService.unsubscribe(token);
        model.addAttribute("projectName", projectName);
        return "unsubscribed";
    }

    @GetMapping("/p/{slug}/stats")
    public String statsPage(@PathVariable String slug, HttpSession session, Model model) {
        User user = authService.getSessionUser(session);
        if (user == null) return "redirect:/login";
        Map<String, Object> stats = projectService.getStats(slug, user);
        stats.forEach(model::addAttribute);
        model.addAttribute("user", user);
        return "stats";
    }

    private String getClientIp(HttpServletRequest req) {
        if (trustProxy) {
            String xff = req.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        }
        return req.getRemoteAddr();
    }
}
