package uz.uzlaunch.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import uz.uzlaunch.service.AdminService;
import uz.uzlaunch.service.RateLimiter;

import java.util.Collections;
import java.util.stream.Collectors;

import java.nio.charset.StandardCharsets;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    @Autowired private AdminService adminService;

    @Autowired
    @Qualifier("adminRateLimiter")
    private RateLimiter adminRateLimiter;

    @Value("${admin.secret}")
    private String adminSecret;

    @GetMapping({"", "/"})
    public String adminPage(HttpSession session, Model model) {
        if (!isAdmin(session)) return "admin-login";
        try {
            AdminService.AdminStats stats = adminService.getStats();
            model.addAttribute("userCount", stats.userCount());
            model.addAttribute("projectCount", stats.projectCount());
            model.addAttribute("subscriberCount", stats.subscriberCount());
            model.addAttribute("todaySignups", stats.todaySignups());
            model.addAttribute("users", stats.users());
            model.addAttribute("projects", stats.projects());
            model.addAttribute("topProjects", stats.topProjects());
            String chartLabels = stats.dailySignups().stream()
                .map(d -> "\"" + d.date() + "\"")
                .collect(Collectors.joining(",", "[", "]"));
            String chartData = stats.dailySignups().stream()
                .map(d -> String.valueOf(d.count()))
                .collect(Collectors.joining(",", "[", "]"));
            model.addAttribute("chartLabels", chartLabels);
            model.addAttribute("chartData", chartData);
            model.addAttribute("pendingByProject", stats.pendingByProject());
            model.addAttribute("pendingSubscribers", stats.pendingSubscribers());
        } catch (Exception e) {
            log.error("Admin stats error: {}", e.getMessage());
            model.addAttribute("userCount", 0L);
            model.addAttribute("projectCount", 0L);
            model.addAttribute("subscriberCount", 0L);
            model.addAttribute("todaySignups", 0L);
            model.addAttribute("users", Collections.emptyList());
            model.addAttribute("projects", Collections.emptyList());
            model.addAttribute("topProjects", Collections.emptyList());
            model.addAttribute("chartLabels", "[]");
            model.addAttribute("chartData", "[]");
            model.addAttribute("pendingByProject", Collections.emptyMap());
            model.addAttribute("pendingSubscribers", Collections.emptyList());
            model.addAttribute("error", "Stats loading failed: " + e.getMessage());
        }
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
    public String upgradeUser(@PathVariable String id, HttpSession session, RedirectAttributes ra) {
        if (!isAdmin(session)) return "redirect:/admin";
        try { ra.addFlashAttribute("success", adminService.upgradeUser(id) + " upgraded to Pro"); }
        catch (IllegalArgumentException e) { ra.addFlashAttribute("error", e.getMessage()); }
        return "redirect:/admin";
    }

    @PostMapping("/users/{id}/downgrade")
    public String downgradeUser(@PathVariable String id, HttpSession session, RedirectAttributes ra) {
        if (!isAdmin(session)) return "redirect:/admin";
        try { ra.addFlashAttribute("success", adminService.downgradeUser(id) + " downgraded to Free"); }
        catch (IllegalArgumentException e) { ra.addFlashAttribute("error", e.getMessage()); }
        return "redirect:/admin";
    }

    @PostMapping("/users/{id}/ban")
    public String banUser(@PathVariable String id, HttpSession session, RedirectAttributes ra) {
        if (!isAdmin(session)) return "redirect:/admin";
        try { ra.addFlashAttribute("success", adminService.banUser(id) + " banned"); }
        catch (IllegalArgumentException e) { ra.addFlashAttribute("error", e.getMessage()); }
        return "redirect:/admin";
    }

    @PostMapping("/users/{id}/unban")
    public String unbanUser(@PathVariable String id, HttpSession session, RedirectAttributes ra) {
        if (!isAdmin(session)) return "redirect:/admin";
        try { ra.addFlashAttribute("success", adminService.unbanUser(id) + " unbanned"); }
        catch (IllegalArgumentException e) { ra.addFlashAttribute("error", e.getMessage()); }
        return "redirect:/admin";
    }

    @PostMapping("/users/{id}/delete")
    public String deleteUser(@PathVariable String id, HttpSession session, RedirectAttributes ra) {
        if (!isAdmin(session)) return "redirect:/admin";
        try { ra.addFlashAttribute("success", "User " + adminService.deleteUser(id) + " deleted"); }
        catch (IllegalArgumentException e) { ra.addFlashAttribute("error", e.getMessage()); }
        return "redirect:/admin";
    }

    @PostMapping("/projects/{id}/delete")
    public String deleteProject(@PathVariable Long id, HttpSession session, RedirectAttributes ra) {
        if (!isAdmin(session)) return "redirect:/admin";
        try { ra.addFlashAttribute("success", "Project \"" + adminService.deleteProject(id) + "\" deleted"); }
        catch (IllegalArgumentException e) { ra.addFlashAttribute("error", e.getMessage()); }
        return "redirect:/admin";
    }

    @PostMapping("/subscribers/{id}/confirm")
    public String confirmSubscriber(@PathVariable Long id, HttpSession session, RedirectAttributes ra) {
        if (!isAdmin(session)) return "redirect:/admin";
        try { ra.addFlashAttribute("success", adminService.confirmSubscriber(id) + " confirmed"); }
        catch (IllegalArgumentException e) { ra.addFlashAttribute("error", e.getMessage()); }
        return "redirect:/admin";
    }

    @PostMapping("/subscribers/{id}/delete")
    public String deletePendingSubscriber(@PathVariable Long id, HttpSession session, RedirectAttributes ra) {
        if (!isAdmin(session)) return "redirect:/admin";
        try { ra.addFlashAttribute("success", adminService.deletePendingSubscriber(id) + " deleted"); }
        catch (IllegalArgumentException e) { ra.addFlashAttribute("error", e.getMessage()); }
        return "redirect:/admin";
    }

    @PostMapping("/broadcast")
    public String broadcast(@RequestParam String subject,
                            @RequestParam String body,
                            HttpSession session,
                            RedirectAttributes ra) {
        if (!isAdmin(session)) return "redirect:/admin";
        if (subject.isBlank() || body.isBlank()) {
            ra.addFlashAttribute("error", "Subject and body required");
            return "redirect:/admin";
        }
        int sent = adminService.broadcastEmail(subject, body);
        ra.addFlashAttribute("success", "Broadcast sent to " + sent + " users");
        return "redirect:/admin";
    }

    @GetMapping("/export/users")
    public ResponseEntity<byte[]> exportUsers(HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).build();
        byte[] csv = adminService.exportUsersCsv().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"users.csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }

    @GetMapping("/export/subscribers")
    public ResponseEntity<byte[]> exportSubscribers(HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).build();
        byte[] csv = adminService.exportSubscribersCsv().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"subscribers.csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }

    private boolean isAdmin(HttpSession session) {
        return Boolean.TRUE.equals(session.getAttribute("isAdmin"));
    }
}
