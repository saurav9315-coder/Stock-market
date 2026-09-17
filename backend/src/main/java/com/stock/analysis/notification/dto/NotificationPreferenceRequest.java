package com.stock.analysis.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceRequest {
    private Boolean emailEnabled;
    private Boolean inAppEnabled;
    private Boolean pushEnabled;
    private Boolean smsEnabled;
    private Boolean whatsappEnabled;
    private Boolean marketingEmails;
    private Boolean tradingAlerts;
    private Boolean aiAlerts;
    private Boolean securityAlerts;
    private Boolean newsAlerts;
}
