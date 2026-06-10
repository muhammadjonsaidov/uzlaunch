package uz.uzlaunch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.Subscriber;
import uz.uzlaunch.repository.ProjectRepository;
import uz.uzlaunch.repository.SubscriberRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ValidationScoreService {

    private final SubscriberRepository subscriberRepo;
    private final ProjectRepository projectRepo;

    public record ScoreBreakdown(
            int score, long confirmed,
            int volumePoints, int commitmentPoints, int momentumPoints,
            long wouldUse, long wouldPay, long payNow) {}

    public void recompute(Project project) {
        ScoreBreakdown bd = compute(project);
        project.setValidationScore(bd.score());
        projectRepo.save(project);
    }

    public ScoreBreakdown compute(Project project) {
        long confirmed = subscriberRepo.countByProjectAndConfirmed(project, true);
        if (confirmed == 0) return new ScoreBreakdown(0, 0, 0, 0, 0, 0, 0, 0);

        int volume = (int) Math.min(40.0, 40.0 * Math.log10(confirmed + 1) / Math.log10(1001));

        List<Object[]> raw = subscriberRepo.countByCommitment(project);
        Map<Subscriber.Commitment, Long> cm = raw.stream()
                .collect(Collectors.toMap(r -> (Subscriber.Commitment) r[0], r -> (Long) r[1]));
        long wu = cm.getOrDefault(Subscriber.Commitment.WOULD_USE, 0L);
        long wp = cm.getOrDefault(Subscriber.Commitment.WOULD_PAY, 0L);
        long pn = cm.getOrDefault(Subscriber.Commitment.PAY_NOW, 0L);
        int commitment = (int) Math.round(40.0 * (wu + wp * 2L + pn * 3L) / (confirmed * 3.0));

        LocalDateTime now = LocalDateTime.now();
        long last7d = subscriberRepo.countConfirmedSince(project, now.minusDays(7));
        long prior7d = subscriberRepo.countConfirmedBetween(project, now.minusDays(14), now.minusDays(7));
        int momentum = prior7d == 0
                ? (last7d > 0 ? 20 : 0)
                : (int) Math.min(20.0, 20.0 * last7d / prior7d);

        int score = Math.max(0, Math.min(100, volume + commitment + momentum));
        return new ScoreBreakdown(score, confirmed, volume, commitment, momentum, wu, wp, pn);
    }
}
