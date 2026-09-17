package com.stock.analysis.notification.mapper;

import com.stock.analysis.notification.domain.Notification;
import com.stock.analysis.notification.domain.NotificationPreference;
import com.stock.analysis.notification.domain.NotificationRule;
import com.stock.analysis.notification.dto.NotificationPreferenceResponse;
import com.stock.analysis.notification.dto.NotificationResponse;
import com.stock.analysis.notification.dto.NotificationRuleResponse;
import com.stock.analysis.users.User;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-01T18:49:57+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class NotificationMapperImpl implements NotificationMapper {

    @Override
    public NotificationResponse toResponse(Notification notification) {
        if ( notification == null ) {
            return null;
        }

        NotificationResponse.NotificationResponseBuilder notificationResponse = NotificationResponse.builder();

        notificationResponse.userId( notificationUserId( notification ) );
        notificationResponse.archived( notification.isArchived() );
        notificationResponse.archivedAt( notification.getArchivedAt() );
        notificationResponse.category( notification.getCategory() );
        notificationResponse.channel( notification.getChannel() );
        notificationResponse.createdAt( notification.getCreatedAt() );
        notificationResponse.id( notification.getId() );
        notificationResponse.message( notification.getMessage() );
        notificationResponse.metadataJson( notification.getMetadataJson() );
        notificationResponse.priority( notification.getPriority() );
        notificationResponse.read( notification.isRead() );
        notificationResponse.readAt( notification.getReadAt() );
        notificationResponse.referenceUrl( notification.getReferenceUrl() );
        notificationResponse.severity( notification.getSeverity() );
        notificationResponse.title( notification.getTitle() );

        return notificationResponse.build();
    }

    @Override
    public NotificationPreferenceResponse toPreferenceResponse(NotificationPreference preference) {
        if ( preference == null ) {
            return null;
        }

        NotificationPreferenceResponse.NotificationPreferenceResponseBuilder notificationPreferenceResponse = NotificationPreferenceResponse.builder();

        notificationPreferenceResponse.userId( preferenceUserId( preference ) );
        notificationPreferenceResponse.aiAlerts( preference.isAiAlerts() );
        notificationPreferenceResponse.emailEnabled( preference.isEmailEnabled() );
        notificationPreferenceResponse.inAppEnabled( preference.isInAppEnabled() );
        notificationPreferenceResponse.marketingEmails( preference.isMarketingEmails() );
        notificationPreferenceResponse.newsAlerts( preference.isNewsAlerts() );
        notificationPreferenceResponse.pushEnabled( preference.isPushEnabled() );
        notificationPreferenceResponse.securityAlerts( preference.isSecurityAlerts() );
        notificationPreferenceResponse.smsEnabled( preference.isSmsEnabled() );
        notificationPreferenceResponse.tradingAlerts( preference.isTradingAlerts() );
        notificationPreferenceResponse.whatsappEnabled( preference.isWhatsappEnabled() );

        return notificationPreferenceResponse.build();
    }

    @Override
    public NotificationRuleResponse toRuleResponse(NotificationRule rule) {
        if ( rule == null ) {
            return null;
        }

        NotificationRuleResponse.NotificationRuleResponseBuilder notificationRuleResponse = NotificationRuleResponse.builder();

        notificationRuleResponse.userId( ruleUserId( rule ) );
        notificationRuleResponse.active( rule.isActive() );
        notificationRuleResponse.conditionOperator( rule.getConditionOperator() );
        notificationRuleResponse.createdAt( rule.getCreatedAt() );
        notificationRuleResponse.id( rule.getId() );
        notificationRuleResponse.lastTriggeredAt( rule.getLastTriggeredAt() );
        notificationRuleResponse.ruleType( rule.getRuleType() );
        notificationRuleResponse.symbol( rule.getSymbol() );
        notificationRuleResponse.targetValue( rule.getTargetValue() );

        return notificationRuleResponse.build();
    }

    private UUID notificationUserId(Notification notification) {
        if ( notification == null ) {
            return null;
        }
        User user = notification.getUser();
        if ( user == null ) {
            return null;
        }
        UUID id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private UUID preferenceUserId(NotificationPreference notificationPreference) {
        if ( notificationPreference == null ) {
            return null;
        }
        User user = notificationPreference.getUser();
        if ( user == null ) {
            return null;
        }
        UUID id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private UUID ruleUserId(NotificationRule notificationRule) {
        if ( notificationRule == null ) {
            return null;
        }
        User user = notificationRule.getUser();
        if ( user == null ) {
            return null;
        }
        UUID id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
