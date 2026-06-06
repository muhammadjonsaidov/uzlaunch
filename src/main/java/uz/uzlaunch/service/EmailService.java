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
        String unsubUrl  = baseUrl + "/unsubscribe?token=" + token;

        String body = "<p style='margin:0 0 16px'>Hi <strong>" + esc(name) + "</strong>,</p>"
            + "<p style='margin:0 0 24px;color:#475569'>You signed up for the <strong style='color:#1e293b'>"
            + esc(projectName) + "</strong> waitlist. Click below to confirm your spot:</p>"
            + btn(confirmUrl, "Confirm my spot")
            + "<p style='margin:24px 0 0;font-size:13px;color:#94a3b8'>Or paste this link in your browser:<br/>"
            + "<a href='" + confirmUrl + "' style='color:#6366f1;word-break:break-all'>" + confirmUrl + "</a></p>"
            + "<p style='margin:20px 0 0;font-size:12px;color:#cbd5e1'>Didn't sign up? Ignore this email.</p>";

        send(toEmail,
             "Confirm your spot on the " + projectName + " waitlist",
             wrap(projectName, body, unsubUrl));
    }

    public void sendSubscriptionConfirmed(String toEmail, String toName,
                                          String projectName, String projectSlug, String token) {
        String name    = (toName != null && !toName.isBlank()) ? toName : "there";
        String pageUrl = baseUrl + "/p/" + projectSlug;
        String unsubUrl = baseUrl + "/unsubscribe?token=" + token;

        String body = "<p style='margin:0 0 16px'>Hi <strong>" + esc(name) + "</strong>,</p>"
            + "<div style='background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 24px;text-align:center'>"
            + "<p style='margin:0;font-size:28px'>🎉</p>"
            + "<p style='margin:8px 0 0;font-weight:700;color:#15803d;font-size:16px'>You're on the waitlist!</p>"
            + "<p style='margin:6px 0 0;color:#166534;font-size:14px'>You're confirmed for <strong>" + esc(projectName) + "</strong></p>"
            + "</div>"
            + "<p style='margin:0 0 24px;color:#475569'>We'll notify you the moment we launch. Stay tuned!</p>"
            + btn(pageUrl, "View the page")
            + "<p style='margin:20px 0 0;font-size:12px;color:#cbd5e1'>You're receiving this because you subscribed to " + esc(projectName) + ".</p>";

        send(toEmail,
             "You're confirmed on the " + projectName + " waitlist! 🎉",
             wrap(projectName, body, unsubUrl));
    }

    public void sendOwnerNotification(String ownerEmail, String ownerName,
                                      String subscriberEmail, String subscriberName,
                                      String projectName, int totalCount) {
        String who = (subscriberName != null && !subscriberName.isBlank())
            ? subscriberName + " (" + subscriberEmail + ")"
            : subscriberEmail;
        String dashUrl = baseUrl + "/dashboard";

        String body = "<p style='margin:0 0 16px'>Hi <strong>" + esc(ownerName) + "</strong>,</p>"
            + "<div style='background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:20px;margin:0 0 24px'>"
            + "<p style='margin:0;font-size:13px;color:#6366f1;font-weight:700;text-transform:uppercase;letter-spacing:0.05em'>New subscriber</p>"
            + "<p style='margin:6px 0 0;font-size:18px;font-weight:800;color:#312e81'>" + esc(who) + "</p>"
            + "<p style='margin:8px 0 0;font-size:13px;color:#6366f1'>joined <strong>" + esc(projectName) + "</strong></p>"
            + "</div>"
            + "<div style='display:flex;gap:16px;margin:0 0 24px'>"
            + "<div style='flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;text-align:center'>"
            + "<p style='margin:0;font-size:28px;font-weight:900;color:#6366f1'>" + totalCount + "</p>"
            + "<p style='margin:4px 0 0;font-size:12px;color:#94a3b8'>total confirmed</p>"
            + "</div></div>"
            + btn(dashUrl, "Open dashboard");

        send(ownerEmail,
             "🔔 New subscriber for " + projectName + " (" + totalCount + " total)",
             wrap("UZLaunch", body, null));
    }

    public void sendLaunchAnnouncement(String toEmail, String toName,
                                       String projectName, String projectSlug, String token) {
        String name = (toName != null && !toName.isBlank()) ? toName : "there";
        String pageUrl = baseUrl + "/p/" + projectSlug;
        String unsubUrl = baseUrl + "/unsubscribe?token=" + token;

        String body = "<p style='margin:0 0 16px'>Hi <strong>" + esc(name) + "</strong>,</p>"
            + "<div style='background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #86efac;border-radius:12px;padding:24px;margin:0 0 24px;text-align:center'>"
            + "<p style='margin:0;font-size:36px'>🚀</p>"
            + "<p style='margin:10px 0 4px;font-weight:900;color:#15803d;font-size:20px'>We're live!</p>"
            + "<p style='margin:0;color:#166534;font-size:15px'><strong>" + esc(projectName) + "</strong> has officially launched!</p>"
            + "</div>"
            + "<p style='margin:0 0 24px;color:#475569'>The wait is over. Head over to the page and check it out — you're among the first to know!</p>"
            + btn(pageUrl, "Visit " + esc(projectName) + " →")
            + "<p style='margin:20px 0 0;font-size:12px;color:#cbd5e1'>You're receiving this because you joined the <strong>" + esc(projectName) + "</strong> waitlist.</p>";

        send(toEmail,
             "🚀 " + projectName + " is live!",
             wrap(projectName, body, unsubUrl));
    }

    public int broadcastToUsers(List<String> emails, String subject, String body) {
        String html = wrap("UZLaunch",
            "<p style='margin:0 0 16px;color:#475569'>" + esc(body).replace("\n", "<br/>") + "</p>",
            null);
        int sent = 0;
        for (String email : emails) {
            send(email, subject, html);
            sent++;
        }
        return sent;
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private String wrap(String projectName, String bodyHtml, String unsubUrl) {
        String logoUrl = baseUrl + "/favicon-512.png";
        String footer = unsubUrl != null
            ? "<a href='" + unsubUrl + "' style='color:#94a3b8'>Unsubscribe</a> &nbsp;·&nbsp; Powered by UZLaunch"
            : "Powered by <a href='https://www.uzlaunch.uz' style='color:#94a3b8'>UZLaunch</a>";
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'/>"
            + "<meta name='viewport' content='width=device-width,initial-scale=1'/></head>"
            + "<body style='margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif'>"
            + "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f1f5f9'>"
            + "<tr><td align='center' style='padding:40px 16px'>"
            + "<table width='560' cellpadding='0' cellspacing='0' style='max-width:560px;width:100%'>"
            // header
            + "<tr><td style='background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px 16px 0 0;"
            + "padding:28px 40px;text-align:center'>"
            + "<img src='" + logoUrl + "' width='48' height='48' style='border-radius:12px;display:block;margin:0 auto 10px'/>"
            + "<span style='color:white;font-size:20px;font-weight:900;letter-spacing:-0.5px'>UZLaunch</span>"
            + "</td></tr>"
            // body
            + "<tr><td style='background:white;padding:36px 40px;border-radius:0 0 16px 16px;"
            + "color:#1e293b;font-size:15px;line-height:1.6'>"
            + bodyHtml
            + "</td></tr>"
            // footer
            + "<tr><td style='padding:20px;text-align:center;font-size:12px;color:#94a3b8'>" + footer + "</td></tr>"
            + "</table></td></tr></table></body></html>";
    }

    private String btn(String url, String label) {
        return "<a href='" + url + "' style='display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);"
            + "color:white;font-weight:700;font-size:15px;text-decoration:none;padding:14px 32px;"
            + "border-radius:12px;box-shadow:0 4px 20px rgba(99,102,241,0.4)'>" + label + "</a>";
    }

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    private void send(String to, String subject, String html) {
        if (apiKey.isBlank()) { log.warn("RESEND_API_KEY not set, skipping email to {}", to); return; }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("from", fromAddress);
            body.put("to", List.of(to));
            body.put("subject", subject);
            body.put("html", html);

            rest.exchange("https://api.resend.com/emails",
                HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.warn("Email send failed to {}: {}", to, e.getMessage());
        }
    }
}
