package uz.uzlaunch.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import uz.uzlaunch.dto.ProjectCreateRequest;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.User;
import uz.uzlaunch.service.AuthService;
import uz.uzlaunch.service.ProjectService;
import uz.uzlaunch.service.SseService;
import uz.uzlaunch.service.SubscriberService;

import java.io.IOException;
import java.io.PrintWriter;

@Controller
@RequiredArgsConstructor
public class ProjectController {

    private final AuthService authService;
    private final ProjectService projectService;
    private final SseService sseService;
    private final SubscriberService subscriberService;

    @Value("${app.base-url:http://localhost:8080}")
    private final String baseUrl;

    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        User user = authService.getSessionUser(session);
        if (user == null) return "redirect:/login";
        model.addAttribute("user", user);
        model.addAttribute("projects", projectService.listByUser(user));
        return "dashboard";
    }

    @GetMapping("/projects/new")
    public String newProjectPage(HttpSession session, RedirectAttributes ra) {
        User user = authService.getSessionUser(session);
        if (user == null) return "redirect:/login";
        if (user.getPlan() == User.Plan.FREE && projectService.listByUser(user).size() >= 1) {
            ra.addFlashAttribute("error", "Free plan allows only 1 waitlist. Upgrade to Pro for unlimited.");
            return "redirect:/dashboard";
        }
        return "project-new";
    }

    @PostMapping("/projects/new")
    public String createProject(@Valid @ModelAttribute ProjectCreateRequest req,
                                BindingResult errors,
                                HttpSession session,
                                RedirectAttributes ra) {
        User user = authService.getSessionUser(session);
        if (user == null) return "redirect:/login";
        if (errors.hasErrors()) {
            ra.addFlashAttribute("error", errors.getAllErrors().get(0).getDefaultMessage());
            return "redirect:/projects/new";
        }
        Project p = projectService.create(req, user);
        ra.addFlashAttribute("success", "Project created! Share: /p/" + p.getSlug());
        return "redirect:/dashboard";
    }

    @GetMapping("/projects/{id}")
    public String projectDetail(@PathVariable Long id,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "") String q,
                                HttpSession session, Model model) {
        User user = authService.getSessionUser(session);
        if (user == null) return "redirect:/login";
        ProjectService.ProjectDetail detail = projectService.getProjectDetail(id, user, page, q);
        model.addAttribute("project", detail.project());
        model.addAttribute("subscribers", detail.subscribers());
        model.addAttribute("locked", detail.locked());
        model.addAttribute("total", detail.total());
        model.addAttribute("currentPage", detail.page());
        model.addAttribute("totalPages", detail.totalPages());
        model.addAttribute("pending", detail.pending());
        model.addAttribute("user", user);
        model.addAttribute("baseUrl", baseUrl);
        model.addAttribute("q", detail.q());
        return "project-detail";
    }

    @GetMapping("/projects/{id}/edit")
    public String editProjectPage(@PathVariable Long id, HttpSession session, Model model) {
        User user = authService.getSessionUser(session);
        if (user == null) return "redirect:/login";
        Project p = projectService.getOwned(id, user);
        model.addAttribute("project", p);
        return "project-edit";
    }

    @PostMapping("/projects/{id}/edit")
    public String editProject(@PathVariable Long id,
                              @Valid @ModelAttribute ProjectCreateRequest req,
                              BindingResult errors,
                              HttpSession session,
                              RedirectAttributes ra) {
        User user = authService.getSessionUser(session);
        if (user == null) return "redirect:/login";
        if (errors.hasErrors()) {
            ra.addFlashAttribute("error", errors.getAllErrors().get(0).getDefaultMessage());
            return "redirect:/projects/" + id + "/edit";
        }
        projectService.update(id, req, user);
        ra.addFlashAttribute("success", "Project updated");
        return "redirect:/projects/" + id;
    }

    @PostMapping("/projects/{id}/delete")
    public String deleteProject(@PathVariable Long id, HttpSession session, RedirectAttributes ra) {
        User user = authService.getSessionUser(session);
        if (user == null) return "redirect:/login";
        String name = projectService.delete(id, user);
        ra.addFlashAttribute("success", "Project \"" + name + "\" deleted");
        return "redirect:/dashboard";
    }

    @PostMapping("/projects/{id}/subscribers/{subId}/delete")
    public String deleteSubscriber(@PathVariable Long id, @PathVariable Long subId,
                                   HttpSession session, RedirectAttributes ra) {
        User user = authService.getSessionUser(session);
        if (user == null) return "redirect:/login";
        Project project = projectService.getOwned(id, user);
        subscriberService.deleteSubscriber(subId, project);
        ra.addFlashAttribute("success", "Subscriber removed");
        return "redirect:/projects/" + id;
    }

    @PostMapping("/projects/{id}/subscribers/{subId}/resend")
    public String resendConfirmation(@PathVariable Long id, @PathVariable Long subId,
                                     HttpSession session, RedirectAttributes ra) {
        User user = authService.getSessionUser(session);
        if (user == null) return "redirect:/login";
        Project project = projectService.getOwned(id, user);
        subscriberService.resendConfirmation(subId, project);
        ra.addFlashAttribute("success", "Confirmation email resent");
        return "redirect:/projects/" + id;
    }

    @GetMapping(value = "/projects/{id}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @ResponseBody
    public SseEmitter stream(@PathVariable Long id, HttpSession session, HttpServletResponse response) throws IOException {
        User user = authService.getSessionUser(session);
        if (user == null) { response.sendError(HttpServletResponse.SC_UNAUTHORIZED); return null; }
        try {
            projectService.getOwned(id, user);
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return null;
        }
        return sseService.subscribe(id);
    }

    @GetMapping("/projects/{id}/export")
    public void exportCsv(@PathVariable Long id,
                          HttpSession session,
                          HttpServletResponse response) throws IOException {
        User user = authService.getSessionUser(session);
        if (user == null) { response.sendRedirect("/login"); return; }

        ProjectService.ExportData data = projectService.getExportData(id, user);
        response.setContentType("text/csv;charset=UTF-8");
        response.setHeader("Content-Disposition",
            "attachment; filename=\"" + data.project().getSlug() + "-subscribers.csv\"");

        PrintWriter w = response.getWriter();
        w.println("Name,Email,Subscribed At");
        data.subscribers().forEach(s ->
            w.println(csvEscape(s.getName() != null ? s.getName() : "") + ","
                + csvEscape(s.getEmail()) + "," + s.getSubscribedAt())
        );
        w.flush();
    }

    private String csvEscape(String v) {
        if (v == null || v.isEmpty()) return "";
        if (v.contains(",") || v.contains("\"") || v.contains("\n"))
            return "\"" + v.replace("\"", "\"\"") + "\"";
        return v;
    }
}
