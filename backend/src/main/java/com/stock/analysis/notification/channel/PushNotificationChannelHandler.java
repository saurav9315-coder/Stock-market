package com.stock.analysis.notification.channel;

import com.stock.analysis.notification.domain.Notification;
import com.stock.analysis.notification.domain.NotificationChannel;
import com.stock.analysis.users.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class PushNotificationChannelHandler implements NotificationChannelHandler {

    @Override
    public boolean supports(NotificationChannel channel) {
        return NotificationChannel.PUSH == channel;
    }

    @Override
    public void send(Notification notification, User recipient, Map<String, Object> templateModel) {
        log.info("[FCM/OneSignal Push Stub] Dispatching Push Notification to user {}: Title='{}'", recipient.getId(), notification.getTitle());
        // Production Integration Hook: Connect to Firebase Cloud Messaging (FCM) or OneSignal REST API SDK
    }
}
