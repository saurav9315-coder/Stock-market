package com.stock.analysis.notification.dto;

import com.stock.analysis.notification.domain.NotificationCategory;
import com.stock.analysis.notification.domain.NotificationChannel;
import com.stock.analysis.notification.domain.NotificationPriority;
import com.stock.analysis.notification.domain.NotificationSeverity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private UUID id;
    private UUID userId;
    private NotificationCategory category;
    private NotificationChannel channel;
    private NotificationPriority priority;
    private NotificationSeverity severity;
    private String title;
    private String message;
    private String referenceUrl;
    private String metadataJson;
    private boolean read;
    private Instant readAt;
    private boolean archived;
    private Instant archivedAt;
    private Instant createdAt;
}
