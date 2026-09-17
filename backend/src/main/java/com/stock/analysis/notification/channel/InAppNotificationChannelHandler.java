package com.stock.analysis.notification.channel;

import com.stock.analysis.notification.domain.Notification;
import com.stock.analysis.notification.domain.NotificationChannel;
import com.stock.analysis.notification.repository.NotificationRepository;
import com.stock.analysis.users.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class InAppNotificationChannelHandler implements NotificationChannelHandler {

    private final NotificationRepository notificationRepository;

    @Override
    public boolean supports(NotificationChannel channel) {
        return NotificationChannel.IN_APP == channel;
    }

    @Override
    public void send(Notification notification, User recipient, Map<String, Object> templateModel) {
        log.info("Persisting In-App Notification for user {}: {}", recipient.getId(), notification.getTitle());
        notificationRepository.save(notification);
    }
}
