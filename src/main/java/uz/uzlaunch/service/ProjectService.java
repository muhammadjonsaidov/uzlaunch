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
    private final uz.uzlaunch.repository.UserRepository userRepo;

    public record ProjectDetail(Project project, List<Subscriber> subscribers,
                                boolean locked, long total, int page, int totalPages,
                                List<Subscriber> pending, String q,
                                Map<String, Long> commitmentBreakdown,
                                Map<String, Long> sourceBreakdown) {}
    public record ExportData(Project project, List<Subscriber> subscribers) {}

    public List<Project> listByUser(User user) {
        return projectRepo.findByUser(user);
    }

    public uz.uzlaunch.api.dto.response.FounderProfileResponse founderProfile(String username) {
        User user = userRepo.findByUsername(username).orElseThrow(PageNotFoundException::new);
        if (user.isBanned()) throw new PageNotFoundException();
        List<Project> all = projectRepo.findByUser(user);
        List<Project> publicOnes = all.stream().filter(Project::isPublic).toList();
        long totalSubs = all.stream().mapToLong(Project::getSubscriberCount).sum();
        return new uz.uzlaunch.api.dto.response.FounderProfileResponse(
            user.getUsername(),
            user.getName(),
            user.getBio(),
            user.getAvatarUrl(),
            user.getTwitter(),
            user.getGithub(),
            user.getLinkedin(),
            user.getWebsite(),
            user.getCreatedAt().toString(),
            all.size(),
            totalSubs,
            publicOnes.stream().map(uz.uzlaunch.api.dto.response.ProjectResponse::from).toList()
        );
    }

    public List<uz.uzlaunch.api.dto.response.ProjectResponse> leaderboard(String period) {
        int days = "month".equals(period) ? 30 : 7;
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        org.springframework.data.domain.Pageable top50 = org.springframework.data.domain.PageRequest.of(0, 50);
        org.springframework.data.domain.Page<Object[]> rows = projectRepo.findPublicTrending(since, top50);
        return rows.getContent().stream()
                .map(r -> (Project) r[0])
                .map(uz.uzlaunch.api.dto.response.ProjectResponse::from)
                .toList();
    }

    public uz.uzlaunch.api.dto.response.PagedResponse<uz.uzlaunch.api.dto.response.ProjectResponse> explore(String sort, int page) {
        int size = 12;
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<Project> result;
        if ("newest".equals(sort)) {
            result = projectRepo.findPublicNewest(pageable);
        } else if ("top".equals(sort)) {
            result = projectRepo.findPublicTopScore(pageable);
        } else {
            LocalDateTime since = LocalDateTime.now().minusDays(7);
            org.springframework.data.domain.Page<Object[]> rows = projectRepo.findPublicTrending(since, pageable);
            List<Project> projects = rows.getContent().stream().map(r -> (Project) r[0]).toList();
            return new uz.uzlaunch.api.dto.response.PagedResponse<>(
                projects.stream().map(uz.uzlaunch.api.dto.response.ProjectResponse::from).toList(),
                rows.getNumber(), rows.getTotalPages(), rows.getTotalElements()
            );
        }
        return new uz.uzlaunch.api.dto.response.PagedResponse<>(
            result.getContent().stream().map(uz.uzlaunch.api.dto.response.ProjectResponse::from).toList(),
            result.getNumber(), result.getTotalPages(), result.getTotalElements()
        );
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

        Map<String, Long> breakdown = new LinkedHashMap<>();
        breakdown.put("WOULD_USE", 0L);
        breakdown.put("WOULD_PAY", 0L);
        breakdown.put("PAY_NOW", 0L);
        subscriberRepo.countByCommitment(p).forEach(row -> breakdown.put(row[0].toString(), (Long) row[1]));

        Map<String, Long> sourceBreakdown = new LinkedHashMap<>();
        subscriberRepo.countByUtmSource(p).forEach(row -> {
            String src = row[0] == null || row[0].toString().isEmpty() ? "direct" : row[0].toString();
            sourceBreakdown.merge(src, (Long) row[1], Long::sum);
        });

        return new ProjectDetail(p, result.getContent(), locked, total, effectivePage, displayTotalPages, pending, q, breakdown, sourceBreakdown);
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
        if (req.getFeedbackQuestion() != null && !req.getFeedbackQuestion().isBlank())
            p.setFeedbackQuestion(req.getFeedbackQuestion().trim());
        applyBranding(p, req);
        return projectRepo.save(p);
    }

    private void applyBranding(Project p, ProjectCreateRequest req) {
        p.setLogoUrl(sanitizeLogoUrl(req.getLogoUrl()));
        p.setAccentColor(req.getAccentColor() != null && !req.getAccentColor().isBlank() ? req.getAccentColor().trim() : null);
        if (req.getIsPublic() != null) p.setPublic(req.getIsPublic());
    }

    private static String sanitizeLogoUrl(String raw) {
        if (raw == null) return null;
        String t = raw.trim();
        if (t.isEmpty()) return null;
        if (t.length() > 500) throw new BadRequestException("Logo URL too long (max 500)");
        String lower = t.toLowerCase();
        if (!lower.startsWith("https://") && !lower.startsWith("http://"))
            throw new BadRequestException("Logo URL must start with http:// or https://");
        return t;
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
        p.setFeedbackQuestion(req.getFeedbackQuestion() != null && !req.getFeedbackQuestion().isBlank()
            ? req.getFeedbackQuestion().trim() : null);
        applyBranding(p, req);
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
