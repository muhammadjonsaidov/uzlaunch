package uz.uzlaunch.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import uz.uzlaunch.service.AdminService;
import uz.uzlaunch.service.RateLimiter;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired private AdminService adminService;

    @Autowired
    @Qualifier("adminRateLimiter")
    private RateLimiter adminRateLimiter;

    @Value("${admin.secret}")
    private String adminSecret;

    @GetMapping({"", "/"})
    public String adminPage(HttpSession session, Model model) {
        if (!isAdmin(session)) return "admin-login";
        AdminService.AdminStats stats = adminService.getStats();
        model.addAttribute("userCount", stats.userCount());
        model.addAttribute("projectCount", stats.projectCount());
        model.addAttribute("subscriberCount", stats.subscriberCount());
        model.addAttribute("todaySignups", stats.todaySignups());
        model.addAttribute("users", stats.users());
        model.addAttribute("projects", stats.projects());
        return "admin";
    }

    @PostMapping("/login")
    public String adminLogin(@RequestParam String secret,
                             HttpServletRequest request,
                             HttpSession session,
                             RedirectAttributes ra) {
        String ip = request.getRemoteAddr();
        if (!adminRateLimiter.isAllowed("admin:" + ip)) {
            ra.addFlashAttribute("error", "Too many attempts. Try again in 15 minutes.");
            return "redirect:/admin";
        }
        if (!adminSecret.equals(secret)) {
            ra.addFlashAttribute("error", "Invalid admin secret");
            return "redirect:/admin";
        }
        session.setAttribute("isAdmin", true);
        return "redirect:/admin";
    }

    @GetMapping("/logout")
    public String adminLogout(HttpSession session) {
        session.removeAttribute("isAdmin");
        return "redirect:/";
    }

    @PostMapping("/users/{id}/upgrade")
    public String upgradeUser(@PathVariable String id,
                              HttpSession session,
                              RedirectAttributes ra) {
        if (!isAdmin(session)) return "redirect:/admin";
        try {
            String email = adminService.upgradeUser(id);
            ra.addFlashAttribute("success", email + " upgraded to Pro");
        } catch (IllegalArgumentException e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin";
    }

    @PostMapping("/users/{id}/downgrade")
    public String downgradeUser(@PathVariable String id,
                                HttpSession session,
                                RedirectAttributes ra) {
        if (!isAdmin(session)) return "redirect:/admin";
        try {
            String email = adminService.downgradeUser(id);
            ra.addFlashAttribute("success", email + " downgraded to Free");
        } catch (IllegalArgumentException e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin";
    }

    @PostMapping("/users/{id}/delete")
    public String deleteUser(@PathVariable String id,
                             HttpSession session,
                             RedirectAttributes ra) {
        if (!isAdmin(session)) return "redirect:/admin";
        try {
            String email = adminService.deleteUser(id);
            ra.addFlashAttribute("success", "User " + email + " deleted");
        } catch (IllegalArgumentException e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin";
    }

    @PostMapping("/projects/{id}/delete")
    public String deleteProject(@PathVariable Long id,
                                HttpSession session,
                                RedirectAttributes ra) {
        if (!isAdmin(session)) return "redirect:/admin";
        try {
            String name = adminService.deleteProject(id);
            ra.addFlashAttribute("success", "Project \"" + name + "\" deleted");
        } catch (IllegalArgumentException e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin";
    }

    private boolean isAdmin(HttpSession session) {
        return Boolean.TRUE.equals(session.getAttribute("isAdmin"));
    }
}
