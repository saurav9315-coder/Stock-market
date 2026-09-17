package com.stock.analysis.websocket.model;

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
public class NotificationStreamPayload {

    private UUID notificationId;
    private UUID userId;
    private String category; // PRICE_ALERT, AI_ALERT, NEWS_ALERT, EARNINGS_ALERT, DIVIDEND_ALERT, SECURITY_ALERT, SYSTEM_MAINTENANCE
    private String title;
    private String message;
    private String severity; // INFO, WARNING, CRITICAL
    private String referenceUrl;
    private Instant createdAt;
}
