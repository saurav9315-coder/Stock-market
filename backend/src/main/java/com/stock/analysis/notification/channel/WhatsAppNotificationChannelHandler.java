package com.stock.analysis.notification.channel;

import com.stock.analysis.notification.domain.Notification;
import com.stock.analysis.notification.domain.NotificationChannel;
import com.stock.analysis.users.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class WhatsAppNotificationChannelHandler implements NotificationChannelHandler {

    @Override
    public boolean supports(NotificationChannel channel) {
        return NotificationChannel.WHATSAPP == channel;
    }

    @Override
    public void send(Notification notification, User recipient, Map<String, Object> templateModel) {
        log.info("[WhatsApp Business API Stub] Dispatching WhatsApp Message to user {}: Title='{}'", recipient.getId(), notification.getTitle());
        // Production Integration Hook: Connect to Meta WhatsApp Cloud API / Infobip / Twilio for WhatsApp
    }
}
