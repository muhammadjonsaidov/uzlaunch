package uz.uzlaunch.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${resend.api-key:}")
    private String apiKey;

    @Value("${app.mail.from:noreply@uzlaunch.uz}")
    private String fromAddress;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private final RestTemplate rest = new RestTemplate();

    public void sendSubscriberConfirmation(String toEmail, String toName,
                                           String projectName, String projectSlug, String token) {
        String name = (toName != null && !toName.isBlank()) ? toName : "there";
        String confirmUrl = baseUrl + "/p/" + projectSlug + "/confirm?token=" + token;
        String unsubUrl = baseUrl + "/unsubscribe?token=" + token;
        String text = "Hi " + name + ",\n\n"
            + "Please confirm your spot on the " + projectName + " waitlist by clicking below:\n\n"
            + confirmUrl + "\n\n"
            + "If you didn't sign up, you can safely ignore this email.\n\n"
            + "— The " + projectName + " team\n\n"
            + "---\nUnsubscribe: " + unsubUrl + "\n"
            + "Powered by UZLaunch · uzlaunch.uz";
        send(toEmail, "Confirm your spot on the " + projectName + " waitlist", text);
    }

    public void sendSubscriptionConfirmed(String toEmail, String toName,
                                          String projectName, String projectSlug, String token) {
        String name = (toName != null && !toName.isBlank()) ? toName : "there";
        String unsubUrl = baseUrl + "/unsubscribe?token=" + token;
        String text = "Hi " + name + ",\n\n"
            + "You're confirmed! You're on the waitlist for " + projectName + ".\n\n"
            + "We'll notify you the moment we launch!\n\n"
            + "View the page: " + baseUrl + "/p/" + projectSlug + "\n\n"
            + "— The " + projectName + " team\n\n"
            + "---\nUnsubscribe: " + unsubUrl + "\n"
            + "Powered by UZLaunch · uzlaunch.uz";
        send(toEmail, "You're on the waitlist for " + projectName + "!", text);
    }

    public void sendOwnerNotification(String ownerEmail, String ownerName,
                                      String subscriberEmail, String subscriberName,
                                      String projectName, int totalCount) {
        String who = (subscriberName != null && !subscriberName.isBlank())
            ? subscriberName + " (" + subscriberEmail + ")"
            : subscriberEmail;
        String text = "Hi " + ownerName + ",\n\n"
            + "New confirmed subscriber for " + projectName + "!\n\n"
            + "Subscriber: " + who + "\n"
            + "Total confirmed: " + totalCount + "\n\n"
            + "Dashboard: " + baseUrl + "/dashboard\n\n"
            + "— UZLaunch";
        send(ownerEmail, "New subscriber for " + projectName + "!", text);
    }

    public int broadcastToUsers(List<String> emails, String subject, String body) {
        int sent = 0;
        for (String email : emails) {
            send(email, subject, body);
            sent++;
        }
        return sent;
    }

    private void send(String to, String subject, String text) {
        if (apiKey.isBlank()) return;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("from", fromAddress);
            body.put("to", List.of(to));
            body.put("subject", subject);
            body.put("text", text);

            rest.exchange(
                "https://api.resend.com/emails",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                Map.class
            );
        } catch (Exception e) {
            log.warn("Email send failed to {}: {}", to, e.getMessage());
        }
    }
}
