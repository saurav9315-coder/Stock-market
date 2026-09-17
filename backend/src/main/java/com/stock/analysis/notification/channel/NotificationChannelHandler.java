package com.stock.analysis.notification.channel;

import com.stock.analysis.notification.domain.Notification;
import com.stock.analysis.notification.domain.NotificationChannel;
import com.stock.analysis.users.User;

import java.util.Map;

public interface NotificationChannelHandler {

    boolean supports(NotificationChannel channel);

    void send(Notification notification, User recipient, Map<String, Object> templateModel);
}
