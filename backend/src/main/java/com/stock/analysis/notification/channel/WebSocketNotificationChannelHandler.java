package com.stock.analysis.notification.channel;

import com.stock.analysis.notification.domain.Notification;
import com.stock.analysis.notification.domain.NotificationChannel;
import com.stock.analysis.users.User;
import com.stock.analysis.websocket.model.NotificationStreamPayload;
import com.stock.analysis.websocket.service.RealtimeEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketNotificationChannelHandler implements NotificationChannelHandler {

    private final RealtimeEventPublisher realtimeEventPublisher;

    @Override
    public boolean supports(NotificationChannel channel) {
        return NotificationChannel.WEBSOCKET == channel;
    }

    @Override
    public void send(Notification notification, User recipient, Map<String, Object> templateModel) {
        log.info("Relaying Realtime WebSocket Notification to user {}: {}", recipient.getId(), notification.getTitle());

        NotificationStreamPayload payload = NotificationStreamPayload.builder()
                .notificationId(notification.getId())
                .userId(recipient.getId())
                .category(notification.getCategory().name())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .severity(notification.getSeverity().name())
                .referenceUrl(notification.getReferenceUrl())
                .createdAt(notification.getCreatedAt() != null ? notification.getCreatedAt() : Instant.now())
                .build();

        realtimeEventPublisher.publishNotification(recipient.getId().toString(), payload);
    }
}
