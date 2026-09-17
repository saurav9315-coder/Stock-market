package com.stock.analysis.notification.service;

import com.stock.analysis.exception.ResourceNotFoundException;
import com.stock.analysis.notification.domain.NotificationPreference;
import com.stock.analysis.notification.dto.NotificationPreferenceRequest;
import com.stock.analysis.notification.dto.NotificationPreferenceResponse;
import com.stock.analysis.notification.mapper.NotificationMapper;
import com.stock.analysis.notification.repository.NotificationPreferenceRepository;
import com.stock.analysis.users.User;
import com.stock.analysis.users.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Transactional(readOnly = true)
    public NotificationPreferenceResponse getPreferences(UUID userId) {
        NotificationPreference preference = getOrCreatePreference(userId);
        return notificationMapper.toPreferenceResponse(preference);
    }

    @Transactional
    public NotificationPreferenceResponse updatePreferences(UUID userId, NotificationPreferenceRequest request) {
        log.info("Updating notification preferences for user {}", userId);
        NotificationPreference preference = getOrCreatePreference(userId);

        if (request.getEmailEnabled() != null) preference.setEmailEnabled(request.getEmailEnabled());
        if (request.getInAppEnabled() != null) preference.setInAppEnabled(request.getInAppEnabled());
        if (request.getPushEnabled() != null) preference.setPushEnabled(request.getPushEnabled());
        if (request.getSmsEnabled() != null) preference.setSmsEnabled(request.getSmsEnabled());
        if (request.getWhatsappEnabled() != null) preference.setWhatsappEnabled(request.getWhatsappEnabled());
        if (request.getMarketingEmails() != null) preference.setMarketingEmails(request.getMarketingEmails());
        if (request.getTradingAlerts() != null) preference.setTradingAlerts(request.getTradingAlerts());
        if (request.getAiAlerts() != null) preference.setAiAlerts(request.getAiAlerts());
        if (request.getSecurityAlerts() != null) preference.setSecurityAlerts(request.getSecurityAlerts());
        if (request.getNewsAlerts() != null) preference.setNewsAlerts(request.getNewsAlerts());

        NotificationPreference saved = preferenceRepository.save(preference);
        return notificationMapper.toPreferenceResponse(saved);
    }

    @Transactional
    public NotificationPreference getOrCreatePreference(UUID userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

                    NotificationPreference defaultPreference = NotificationPreference.builder()
                            .user(user)
                            .emailEnabled(true)
                            .inAppEnabled(true)
                            .pushEnabled(true)
                            .smsEnabled(false)
                            .whatsappEnabled(false)
                            .marketingEmails(true)
                            .tradingAlerts(true)
                            .aiAlerts(true)
                            .securityAlerts(true)
                            .newsAlerts(true)
                            .build();

                    return preferenceRepository.save(defaultPreference);
                });
    }
}
