package com.stock.analysis.notification.domain;

import com.stock.analysis.common.BaseEntity;
import com.stock.analysis.users.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreference extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "email_enabled", nullable = false)
    @Builder.Default
    private boolean emailEnabled = true;

    @Column(name = "in_app_enabled", nullable = false)
    @Builder.Default
    private boolean inAppEnabled = true;

    @Column(name = "push_enabled", nullable = false)
    @Builder.Default
    private boolean pushEnabled = true;

    @Column(name = "sms_enabled", nullable = false)
    @Builder.Default
    private boolean smsEnabled = false;

    @Column(name = "whatsapp_enabled", nullable = false)
    @Builder.Default
    private boolean whatsappEnabled = false;

    @Column(name = "marketing_emails", nullable = false)
    @Builder.Default
    private boolean marketingEmails = true;

    @Column(name = "trading_alerts", nullable = false)
    @Builder.Default
    private boolean tradingAlerts = true;

    @Column(name = "ai_alerts", nullable = false)
    @Builder.Default
    private boolean aiAlerts = true;

    @Column(name = "security_alerts", nullable = false)
    @Builder.Default
    private boolean securityAlerts = true;

    @Column(name = "news_alerts", nullable = false)
    @Builder.Default
    private boolean newsAlerts = true;
}
