package com.stock.analysis.notification.channel;

import com.stock.analysis.notification.domain.Notification;
import com.stock.analysis.notification.domain.NotificationAuditLog;
import com.stock.analysis.notification.domain.NotificationChannel;
import com.stock.analysis.notification.domain.NotificationDeliveryStatus;
import com.stock.analysis.notification.repository.NotificationAuditLogRepository;
import com.stock.analysis.users.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationChannelDispatcher {

    private final List<NotificationChannelHandler> channelHandlers;
    private final NotificationAuditLogRepository auditLogRepository;

    @Async
    public void dispatch(NotificationChannel channel, Notification notification, User recipient, Map<String, Object> templateModel) {
        log.info("Routing notification {} to channel {}", notification.getId(), channel);

        NotificationChannelHandler handler = channelHandlers.stream()
                .filter(h -> h.supports(channel))
                .findFirst()
                .orElse(null);

        if (handler == null) {
            log.warn("No suitable NotificationChannelHandler found for channel: {}", channel);
            recordAuditLog(notification, recipient, channel, NotificationDeliveryStatus.FAILED, "No handler configured for " + channel);
            return;
        }

        try {
            handler.send(notification, recipient, templateModel);
            recordAuditLog(notification, recipient, channel, NotificationDeliveryStatus.DELIVERED, null);
        } catch (Exception e) {
            log.error("Failed to dispatch notification {} via channel {}: {}", notification.getId(), channel, e.getMessage(), e);
            recordAuditLog(notification, recipient, channel, NotificationDeliveryStatus.FAILED, e.getMessage());
        }
    }

    private void recordAuditLog(Notification notification, User recipient, NotificationChannel channel, NotificationDeliveryStatus status, String errorMessage) {
        try {
            NotificationAuditLog auditLog = NotificationAuditLog.builder()
                    .notification(notification)
                    .user(recipient)
                    .channel(channel)
                    .status(status)
                    .recipient(recipient.getEmail() != null ? recipient.getEmail() : recipient.getUsername())
                    .errorMessage(errorMessage)
                    .dispatchedAt(Instant.now())
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.warn("Failed to persist notification audit log: {}", e.getMessage());
        }
    }
}
