package com.stock.analysis.notification.mapper;

import com.stock.analysis.notification.domain.Notification;
import com.stock.analysis.notification.domain.NotificationPreference;
import com.stock.analysis.notification.domain.NotificationRule;
import com.stock.analysis.notification.dto.NotificationPreferenceResponse;
import com.stock.analysis.notification.dto.NotificationResponse;
import com.stock.analysis.notification.dto.NotificationRuleResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "userId", source = "user.id")
    NotificationResponse toResponse(Notification notification);

    @Mapping(target = "userId", source = "user.id")
    NotificationPreferenceResponse toPreferenceResponse(NotificationPreference preference);

    @Mapping(target = "userId", source = "user.id")
    NotificationRuleResponse toRuleResponse(NotificationRule rule);
}
