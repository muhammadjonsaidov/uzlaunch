package uz.uzlaunch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uz.uzlaunch.model.PageEvent;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.repository.PageEventRepository;
import uz.uzlaunch.repository.ProjectRepository;
import uz.uzlaunch.repository.SubscriberRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final PageEventRepository eventRepo;
    private final SubscriberRepository subscriberRepo;
    private final ProjectRepository projectRepo;

    public record Funnel(long views, long formStarts, long subscribed, long confirmed,
                          double formStartRate, double subscribeRate, double confirmRate, double overallRate) {}

    public record DailyPoint(String date, long views, long subscribed, long confirmed) {}

    public Funnel computeFunnel(Project project) {
        long views = eventRepo.countByProjectAndType(project, PageEvent.VIEW);
        long formStarts = eventRepo.countByProjectAndType(project, PageEvent.FORM_START);
        long subscribed = subscriberRepo.countByProjectAndConfirmed(project, false)
                        + subscriberRepo.countByProjectAndConfirmed(project, true);
        long confirmed = subscriberRepo.countByProjectAndConfirmed(project, true);

        double formStartRate = views > 0 ? round((double) formStarts / views * 100) : 0;
        double subscribeRate = formStarts > 0 ? round((double) subscribed / formStarts * 100) : 0;
        double confirmRate = subscribed > 0 ? round((double) confirmed / subscribed * 100) : 0;
        double overallRate = views > 0 ? round((double) confirmed / views * 100) : 0;

        return new Funnel(views, formStarts, subscribed, confirmed,
                          formStartRate, subscribeRate, confirmRate, overallRate);
    }

    public List<DailyPoint> computeTrend(Project project, int days) {
        LocalDate today = LocalDate.now();
        LocalDateTime since = today.minusDays(days - 1).atStartOfDay();

        Map<LocalDate, long[]> bucket = new LinkedHashMap<>();
        for (int i = days - 1; i >= 0; i--) bucket.put(today.minusDays(i), new long[3]);

        eventRepo.dailyCountsSince(project, since).forEach(row -> {
            LocalDate d = toDate(row[0]);
            String t = String.valueOf(row[1]);
            long c = ((Number) row[2]).longValue();
            long[] arr = bucket.get(d);
            if (arr == null) return;
            if (PageEvent.VIEW.equals(t)) arr[0] += c;
        });

        subscriberRepo.findByProjectAndConfirmed(project, true).forEach(s -> {
            LocalDate sd = s.getConfirmedAt() != null ? s.getConfirmedAt().toLocalDate() : s.getSubscribedAt().toLocalDate();
            long[] confArr = bucket.get(sd);
            if (confArr != null) confArr[2] += 1;
            LocalDate subDate = s.getSubscribedAt().toLocalDate();
            long[] subArr = bucket.get(subDate);
            if (subArr != null) subArr[1] += 1;
        });
        subscriberRepo.findByProjectAndConfirmed(project, false).forEach(s -> {
            LocalDate subDate = s.getSubscribedAt().toLocalDate();
            long[] subArr = bucket.get(subDate);
            if (subArr != null) subArr[1] += 1;
        });

        List<DailyPoint> points = new ArrayList<>();
        bucket.forEach((d, a) -> points.add(new DailyPoint(d.toString(), a[0], a[1], a[2])));
        return points;
    }

    @org.springframework.transaction.annotation.Transactional
    public void track(Project project, String eventType, String utmSource) {
        if (!PageEvent.VIEW.equals(eventType) && !PageEvent.FORM_START.equals(eventType)) return;
        PageEvent e = new PageEvent();
        e.setProject(project);
        e.setEventType(eventType);
        e.setUtmSource(utmSource);
        eventRepo.save(e);
    }

    private static double round(double v) { return Math.round(v * 10.0) / 10.0; }

    private static LocalDate toDate(Object o) {
        if (o instanceof LocalDate d) return d;
        if (o instanceof java.sql.Date sd) return sd.toLocalDate();
        return LocalDate.parse(o.toString());
    }
}
