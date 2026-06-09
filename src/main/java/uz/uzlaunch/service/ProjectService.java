package uz.uzlaunch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.uzlaunch.dto.ProjectCreateRequest;
import uz.uzlaunch.exception.*;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.Subscriber;
import uz.uzlaunch.model.User;
import uz.uzlaunch.repository.ProjectRepository;
import uz.uzlaunch.repository.SubscriberRepository;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private static final int PAGE_SIZE = 25;

    private final ProjectRepository projectRepo;
    private final SubscriberRepository subscriberRepo;
    private final EmailService emailService;

    public record ProjectDetail(Project project, List<Subscriber> subscribers,
                                boolean locked, long total, int page, int totalPages,
                                List<Subscriber> pending, String q) {}
    public record ExportData(Project project, List<Subscriber> subscribers) {}

    public List<Project> listByUser(User user) {
        return projectRepo.findByUser(user);
    }

    public Project getBySlug(String slug) {
        return projectRepo.findBySlug(slug).orElseThrow(PageNotFoundException::new);
    }

    public Project getOwned(Long id, User user) {
        Project p = projectRepo.findById(id).orElseThrow(ProjectNotFoundException::new);
        if (!p.getUser().getId().equals(user.getId())) throw new ForbiddenException("Not your project");
        return p;
    }

    public Project getOwnedBySlug(String slug, User user) {
        Project p = projectRepo.findBySlug(slug).orElseThrow(ProjectNotFoundException::new);
        if (!p.getUser().getId().equals(user.getId())) throw new ForbiddenException("Not your project");
        return p;
    }

    public ProjectDetail getProjectDetail(Long id, User user, int page, String q) {
        Project p = getOwned(id, user);
        boolean isPaid = user.getPlan() == User.Plan.PAID;

        int effectivePage = (!isPaid && page > 3) ? 3 : page;
        Pageable pageable = PageRequest.of(effectivePage, PAGE_SIZE, Sort.by("subscribedAt").descending());

        Page<Subscriber> result;
        if (q != null && !q.isBlank()) {
            result = subscriberRepo.searchConfirmedByProject(p, q.trim(), pageable);
        } else {
            result = subscriberRepo.findByProjectAndConfirmed(p, true, pageable);
        }

        long total = result.getTotalElements();
        boolean locked = !isPaid && total > 100;
        int displayTotalPages = isPaid ? result.getTotalPages() : Math.min(result.getTotalPages(), 4);
        List<Subscriber> pending = subscriberRepo.findByProjectAndConfirmed(p, false);

        return new ProjectDetail(p, result.getContent(), locked, total, effectivePage, displayTotalPages, pending, q);
    }

    public Project create(ProjectCreateRequest req, User user) {
        if (user.getPlan() == User.Plan.FREE && projectRepo.countByUser(user) >= 1) {
            throw new ForbiddenException("Free plan allows only 1 waitlist. Upgrade to Pro for unlimited.");
        }
        Project p = new Project();
        p.setUser(user);
        p.setSlug(generateSlug(req.getName()));
        p.setName(req.getName().trim());
        p.setTagline(req.getTagline().trim());
        if (req.getDescription() != null && !req.getDescription().isBlank())
            p.setDescription(req.getDescription().trim());
        if (req.getLaunchAt() != null && !req.getLaunchAt().isEmpty()) {
            try { p.setLaunchAt(LocalDateTime.parse(req.getLaunchAt())); }
            catch (Exception e) { throw new BadRequestException("Invalid launch date format. Use ISO-8601: yyyy-MM-ddTHH:mm:ss"); }
        }
        return projectRepo.save(p);
    }

    public Project update(Long id, ProjectCreateRequest req, User user) {
        Project p = getOwned(id, user);
        p.setName(req.getName().trim());
        p.setTagline(req.getTagline().trim());
        p.setDescription(req.getDescription() != null && !req.getDescription().isBlank()
            ? req.getDescription().trim() : null);
        if (req.getLaunchAt() != null && !req.getLaunchAt().isEmpty()) {
            try {
                p.setLaunchAt(LocalDateTime.parse(req.getLaunchAt()));
                p.setLaunchNotified(false);
            } catch (Exception e) {
                throw new BadRequestException("Invalid launch date format. Use ISO-8601: yyyy-MM-ddTHH:mm:ss");
            }
        } else {
            p.setLaunchAt(null);
        }
        if (user.getPlan() == User.Plan.PAID) {
            p.setLaunchEmailSubject(req.getLaunchEmailSubject() != null && !req.getLaunchEmailSubject().isBlank()
                ? req.getLaunchEmailSubject().trim() : null);
            p.setLaunchEmailBody(req.getLaunchEmailBody() != null && !req.getLaunchEmailBody().isBlank()
                ? req.getLaunchEmailBody().trim() : null);
            p.setConfirmEmailSubject(req.getConfirmEmailSubject() != null && !req.getConfirmEmailSubject().isBlank()
                ? req.getConfirmEmailSubject().trim() : null);
            p.setConfirmEmailBody(req.getConfirmEmailBody() != null && !req.getConfirmEmailBody().isBlank()
                ? req.getConfirmEmailBody().trim() : null);
        }
        return projectRepo.save(p);
    }

    @Transactional
    public String delete(Long id, User user) {
        Project p = getOwned(id, user);
        String name = p.getName();
        subscriberRepo.deleteAll(subscriberRepo.findByProject(p));
        projectRepo.delete(p);
        return name;
    }

    public ExportData getExportData(Long id, User user) {
        if (user.getPlan() != User.Plan.PAID) throw new ForbiddenException("CSV export requires Pro plan");
        Project p = getOwned(id, user);
        return new ExportData(p, subscriberRepo.findByProjectAndConfirmed(p, true));
    }

    public Map<String, Object> getStats(String slug, User user) {
        Project p = getOwnedBySlug(slug, user);
        boolean isPaid = user.getPlan() == User.Plan.PAID;
        int days = isPaid ? 30 : 7;
        List<Subscriber> allSubs = subscriberRepo.findByProjectAndConfirmed(p, true);

        LocalDate today = LocalDate.now();
        Map<LocalDate, Long> rawCounts = new LinkedHashMap<>();
        for (int i = days - 1; i >= 0; i--) rawCounts.put(today.minusDays(i), 0L);
        for (Subscriber s : allSubs) {
            LocalDate date = s.getConfirmedAt() != null ? s.getConfirmedAt().toLocalDate() : s.getSubscribedAt().toLocalDate();
            rawCounts.computeIfPresent(date, (k, v) -> v + 1);
        }

        long max = Math.max(rawCounts.values().stream().mapToLong(Long::longValue).max().orElse(1), 1);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d");
        List<Map<String, Object>> chartData = new ArrayList<>();
        for (Map.Entry<LocalDate, Long> e : rawCounts.entrySet()) {
            Map<String, Object> bar = new HashMap<>();
            bar.put("label", e.getKey().format(fmt));
            bar.put("count", e.getValue());
            bar.put("height", (int) (e.getValue() * 150 / max));
            chartData.add(bar);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("project", p);
        stats.put("chartData", chartData);
        stats.put("totalSubscribers", allSubs.size());
        stats.put("statsDays", days);
        stats.put("last7Days", rawCounts.values().stream().mapToLong(Long::longValue).sum());
        return stats;
    }

    private String generateSlug(String name) {
        String base = name.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "").trim().replaceAll("[\\s-]+", "-");
        if (base.isEmpty()) base = "project";
        String slug = base;
        int i = 2;
        while (projectRepo.existsBySlug(slug)) slug = base + "-" + i++;
        return slug;
    }
}
