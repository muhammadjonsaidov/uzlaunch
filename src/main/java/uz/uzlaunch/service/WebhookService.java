package uz.uzlaunch.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import uz.uzlaunch.exception.BadRequestException;
import uz.uzlaunch.exception.ForbiddenException;
import uz.uzlaunch.exception.PageNotFoundException;
import uz.uzlaunch.model.Project;
import uz.uzlaunch.model.User;
import uz.uzlaunch.model.Webhook;
import uz.uzlaunch.model.WebhookDelivery;
import uz.uzlaunch.repository.WebhookDeliveryRepository;
import uz.uzlaunch.repository.WebhookRepository;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class WebhookService {

    private static final int MAX_WEBHOOKS_PER_PROJECT = 5;
    private static final int MAX_RETRIES = 3;
    private static final int[] BACKOFF_MS = { 1000, 5000, 25000 };
    private static final int AUTO_DISABLE_AFTER = 10;
    private static final int DELIVERY_TIMEOUT_MS = 5000;

    private final WebhookRepository webhookRepo;
    private final WebhookDeliveryRepository deliveryRepo;
    private final ProjectService projectService;
    private final ObjectMapper json = new ObjectMapper();
    private final RestClient http = RestClient.builder()
            .requestFactory(new org.springframework.http.client.SimpleClientHttpRequestFactory() {{
                setConnectTimeout(DELIVERY_TIMEOUT_MS);
                setReadTimeout(DELIVERY_TIMEOUT_MS);
            }})
            .build();

    public List<Webhook> list(Long projectId, User user) {
        Project p = projectService.getOwned(projectId, user);
        return webhookRepo.findByProjectOrderByCreatedAtDesc(p);
    }

    @Transactional
    public Webhook create(Long projectId, User user, String url, String events, boolean useSecret) {
        if (user.getPlan() != User.Plan.PAID)
            throw new ForbiddenException("Webhooks require Pro plan");
        validateUrl(url);
        Project p = projectService.getOwned(projectId, user);
        if (webhookRepo.countByProject(p) >= MAX_WEBHOOKS_PER_PROJECT)
            throw new BadRequestException("Max " + MAX_WEBHOOKS_PER_PROJECT + " webhooks per project");

        Webhook w = new Webhook();
        w.setProject(p);
        w.setUrl(url.trim());
        w.setEvents(normalizeEvents(events));
        if (useSecret) w.setSecret(generateSecret());
        return webhookRepo.save(w);
    }

    @Transactional
    public Webhook update(Long id, Long projectId, User user, String url, String events, Boolean active, Boolean rotateSecret) {
        Project p = projectService.getOwned(projectId, user);
        Webhook w = webhookRepo.findByIdAndProject(id, p).orElseThrow(PageNotFoundException::new);
        if (url != null && !url.isBlank()) {
            validateUrl(url);
            w.setUrl(url.trim());
        }
        if (events != null && !events.isBlank()) w.setEvents(normalizeEvents(events));
        if (active != null) {
            w.setActive(active);
            if (active) w.setFailureCount(0);
        }
        if (Boolean.TRUE.equals(rotateSecret)) w.setSecret(generateSecret());
        return webhookRepo.save(w);
    }

    @Transactional
    public void delete(Long id, Long projectId, User user) {
        Project p = projectService.getOwned(projectId, user);
        Webhook w = webhookRepo.findByIdAndProject(id, p).orElseThrow(PageNotFoundException::new);
        deliveryRepo.deleteByWebhook(w);
        webhookRepo.delete(w);
    }

    public org.springframework.data.domain.Page<WebhookDelivery> deliveries(Long id, Long projectId, User user, int page) {
        Project p = projectService.getOwned(projectId, user);
        Webhook w = webhookRepo.findByIdAndProject(id, p).orElseThrow(PageNotFoundException::new);
        return deliveryRepo.findByWebhookOrderByDeliveredAtDesc(w,
                org.springframework.data.domain.PageRequest.of(Math.max(0, page), 25));
    }

    @Transactional
    public WebhookDelivery test(Long id, Long projectId, User user) {
        Project p = projectService.getOwned(projectId, user);
        Webhook w = webhookRepo.findByIdAndProject(id, p).orElseThrow(PageNotFoundException::new);
        Map<String, Object> payload = Map.of(
            "event", "test.ping",
            "project", p.getSlug(),
            "timestamp", LocalDateTime.now().toString(),
            "message", "Test ping from UZLaunch"
        );
        return deliverSync(w, "test.ping", payload);
    }

    public void dispatch(Project project, String eventType, Map<String, Object> payload) {
        List<Webhook> targets = webhookRepo.findByProjectAndActiveTrue(project);
        for (Webhook w : targets) {
            if (w.handles(eventType)) dispatchAsync(w.getId(), eventType, payload);
        }
    }

    @Async
    public void dispatchAsync(Long webhookId, String eventType, Map<String, Object> payload) {
        webhookRepo.findById(webhookId).ifPresent(w -> deliverSync(w, eventType, payload));
    }

    @Transactional
    public WebhookDelivery deliverSync(Webhook w, String eventType, Map<String, Object> payload) {
        WebhookDelivery delivery = new WebhookDelivery();
        delivery.setWebhook(w);
        delivery.setEventType(eventType);
        Map<String, Object> envelope = Map.of(
            "event", eventType,
            "timestamp", LocalDateTime.now().toString(),
            "data", payload
        );
        String body;
        try { body = json.writeValueAsString(envelope); }
        catch (Exception e) { body = "{}"; }
        delivery.setPayload(truncate(body, 4000));

        Integer status = null;
        String responseBody = null;
        String error = null;
        int attempt = 0;

        for (attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("X-UZLaunch-Event", eventType);
                headers.set("X-UZLaunch-Delivery", java.util.UUID.randomUUID().toString());
                if (w.getSecret() != null) headers.set("X-UZLaunch-Signature", sign(body, w.getSecret()));

                var response = http.post().uri(w.getUrl()).headers(h -> h.addAll(headers))
                        .body(body)
                        .retrieve()
                        .toEntity(String.class);
                status = response.getStatusCode().value();
                responseBody = truncate(response.getBody(), 500);
                if (response.getStatusCode().is2xxSuccessful()) break;
            } catch (org.springframework.web.client.HttpStatusCodeException ex) {
                status = ex.getStatusCode().value();
                responseBody = truncate(ex.getResponseBodyAsString(), 500);
                if (!shouldRetry(ex.getStatusCode())) break;
            } catch (ResourceAccessException ex) {
                error = truncate("Timeout/Connection: " + ex.getMessage(), 500);
            } catch (Exception ex) {
                error = truncate(ex.getClass().getSimpleName() + ": " + ex.getMessage(), 500);
            }
            if (attempt < MAX_RETRIES) {
                try { Thread.sleep(BACKOFF_MS[attempt - 1]); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); break; }
            }
        }

        delivery.setStatusCode(status);
        delivery.setResponseBody(responseBody);
        delivery.setError(error);
        delivery.setAttemptCount(Math.min(attempt, MAX_RETRIES));
        deliveryRepo.save(delivery);

        boolean success = status != null && status >= 200 && status < 300;
        w.setLastAttemptAt(LocalDateTime.now());
        w.setLastStatus(status);
        if (success) {
            w.setFailureCount(0);
        } else {
            w.setFailureCount(w.getFailureCount() + 1);
            if (w.getFailureCount() >= AUTO_DISABLE_AFTER) {
                w.setActive(false);
                log.warn("Webhook {} auto-disabled after {} consecutive failures", w.getId(), w.getFailureCount());
            }
        }
        webhookRepo.save(w);
        return delivery;
    }

    private static boolean shouldRetry(HttpStatusCode code) {
        int v = code.value();
        return v == 408 || v == 429 || v >= 500;
    }

    private static void validateUrl(String url) {
        if (url == null || url.isBlank()) throw new BadRequestException("URL is required");
        String t = url.trim();
        if (t.length() > 500) throw new BadRequestException("URL too long (max 500)");
        if (!t.startsWith("https://") && !t.startsWith("http://"))
            throw new BadRequestException("URL must start with http:// or https://");
        String host;
        try {
            host = java.net.URI.create(t).getHost();
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid URL");
        }
        if (host == null) throw new BadRequestException("Invalid URL host");
        String h = host.toLowerCase();
        if (h.equals("localhost") || h.endsWith(".localhost")
                || h.equals("metadata.google.internal")
                || h.startsWith("127.") || h.startsWith("0.")
                || h.startsWith("10.")
                || h.startsWith("192.168.")
                || h.startsWith("169.254.")
                || h.startsWith("::1") || h.startsWith("[::1]")
                || h.matches("^172\\.(1[6-9]|2[0-9]|3[0-1])\\..*"))
            throw new BadRequestException("Internal/private URLs not allowed");
    }

    private static String normalizeEvents(String events) {
        if (events == null || events.isBlank()) return Webhook.EVT_SUB_CREATED + "," + Webhook.EVT_SUB_CONFIRMED;
        java.util.Set<String> allowed = java.util.Set.of(
            Webhook.EVT_SUB_CREATED, Webhook.EVT_SUB_CONFIRMED,
            Webhook.EVT_SUB_UNSUBSCRIBED, Webhook.EVT_BROADCAST_SENT
        );
        StringBuilder sb = new StringBuilder();
        for (String e : events.split(",")) {
            String t = e.trim();
            if (allowed.contains(t)) {
                if (sb.length() > 0) sb.append(",");
                sb.append(t);
            }
        }
        if (sb.length() == 0) throw new BadRequestException("No valid event types specified");
        return sb.toString();
    }

    private static String generateSecret() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private static String sign(String body, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return "sha256=" + HexFormat.of().formatHex(mac.doFinal(body.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            return "";
        }
    }

    private static String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }

}
