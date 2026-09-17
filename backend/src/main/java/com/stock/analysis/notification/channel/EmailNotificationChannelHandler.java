package com.stock.analysis.notification.channel;

import com.stock.analysis.notification.domain.Notification;
import com.stock.analysis.notification.domain.NotificationChannel;
import com.stock.analysis.notification.service.EmailService;
import com.stock.analysis.users.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailNotificationChannelHandler implements NotificationChannelHandler {

    private final EmailService emailService;

    @Override
    public boolean supports(NotificationChannel channel) {
        return NotificationChannel.EMAIL == channel;
    }

    @Override
    public void send(Notification notification, User recipient, Map<String, Object> templateModel) {
        if (recipient.getEmail() == null || recipient.getEmail().isBlank()) {
            log.warn("Recipient user {} has no email address configured. Skipping email dispatch.", recipient.getId());
            return;
        }

        Map<String, Object> model = templateModel != null ? new HashMap<>(templateModel) : new HashMap<>();
        model.putIfAbsent("title", notification.getTitle());
        model.putIfAbsent("message", notification.getMessage());
        model.putIfAbsent("username", recipient.getUsername());
        model.putIfAbsent("referenceUrl", notification.getReferenceUrl());

        String templateName = (String) model.getOrDefault("templateName", getTemplateByCategory(notification.getCategory().name()));

        emailService.sendHtmlEmail(recipient.getEmail(), notification.getTitle(), templateName, model);
    }

    private String getTemplateByCategory(String category) {
        return switch (category) {
            case "AUTHENTICATION" -> "welcome.html";
            case "WALLET" -> "deposit-confirmation.html";
            case "TRADING" -> "trade-confirmation.html";
            case "PORTFOLIO" -> "weekly-portfolio-summary.html";
            default -> "welcome.html";
        };
    }
}
