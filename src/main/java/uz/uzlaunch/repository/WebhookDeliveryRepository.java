package uz.uzlaunch.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import uz.uzlaunch.model.Webhook;
import uz.uzlaunch.model.WebhookDelivery;

public interface WebhookDeliveryRepository extends JpaRepository<WebhookDelivery, Long> {
    Page<WebhookDelivery> findByWebhookOrderByDeliveredAtDesc(Webhook webhook, Pageable pageable);
    void deleteByWebhook(Webhook webhook);
}
