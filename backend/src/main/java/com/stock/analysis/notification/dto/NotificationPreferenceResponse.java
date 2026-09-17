package com.stock.analysis.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceResponse {
    private UUID userId;
    private boolean emailEnabled;
    private boolean inAppEnabled;
    private boolean pushEnabled;
    private boolean smsEnabled;
    private boolean whatsappEnabled;
    private boolean marketingEmails;
    private boolean tradingAlerts;
    private boolean aiAlerts;
    private boolean securityAlerts;
    private boolean newsAlerts;
}
