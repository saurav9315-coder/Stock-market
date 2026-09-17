package com.stock.analysis.notification.dto;

import com.stock.analysis.notification.domain.NotificationCategory;
import com.stock.analysis.notification.domain.NotificationChannel;
import com.stock.analysis.notification.domain.NotificationPriority;
import com.stock.analysis.notification.domain.NotificationSeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendNotificationRequest {
    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Category is required")
    private NotificationCategory category;

    private NotificationChannel channel;

    @Builder.Default
    private NotificationPriority priority = NotificationPriority.MEDIUM;

    @Builder.Default
    private NotificationSeverity severity = NotificationSeverity.INFO;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    private String referenceUrl;

    private Map<String, Object> templateModel;

    private String metadataJson;
}
