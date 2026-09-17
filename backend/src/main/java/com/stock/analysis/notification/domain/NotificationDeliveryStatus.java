package com.stock.analysis.notification.domain;

public enum NotificationDeliveryStatus {
    PENDING,
    SENT,
    DELIVERED,
    FAILED,
    RETRIED,
    DEAD_LETTER
}
