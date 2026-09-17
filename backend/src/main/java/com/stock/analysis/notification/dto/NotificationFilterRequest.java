package com.stock.analysis.notification.dto;

import com.stock.analysis.notification.domain.NotificationCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationFilterRequest {
    private NotificationCategory category;
    private Boolean unreadOnly;
    private String query;
    @Builder.Default
    private int page = 0;
    @Builder.Default
    private int size = 20;
}
