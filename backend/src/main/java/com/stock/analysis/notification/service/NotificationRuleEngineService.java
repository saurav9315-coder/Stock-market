package com.stock.analysis.notification.service;

import com.stock.analysis.exception.ResourceNotFoundException;
import com.stock.analysis.notification.domain.NotificationRule;
import com.stock.analysis.notification.dto.NotificationRuleRequest;
import com.stock.analysis.notification.dto.NotificationRuleResponse;
import com.stock.analysis.notification.mapper.NotificationMapper;
import com.stock.analysis.notification.repository.NotificationRuleRepository;
import com.stock.analysis.users.User;
import com.stock.analysis.users.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationRuleEngineService {

    private final NotificationRuleRepository ruleRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Transactional(readOnly = true)
    public List<NotificationRuleResponse> getUserRules(UUID userId) {
        return ruleRepository.findByUserIdAndActiveTrue(userId)
                .stream()
                .map(notificationMapper::toRuleResponse)
                .toList();
    }

    @Transactional
    public NotificationRuleResponse createRule(UUID userId, NotificationRuleRequest request) {
        log.info("Creating notification rule for user {}: Type='{}', Symbol='{}'", userId, request.getRuleType(), request.getSymbol());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        NotificationRule rule = NotificationRule.builder()
                .user(user)
                .ruleType(request.getRuleType())
                .symbol(request.getSymbol())
                .targetValue(request.getTargetValue())
                .conditionOperator(request.getConditionOperator())
                .active(request.isActive())
                .build();

        NotificationRule saved = ruleRepository.save(rule);
        return notificationMapper.toRuleResponse(saved);
    }

    @Transactional
    public void deleteRule(UUID userId, UUID ruleId) {
        NotificationRule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationRule not found with id: " + ruleId));

        if (!rule.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to delete notification rule.");
        }

        rule.setDeletedAt(Instant.now());
        rule.setActive(false);
        ruleRepository.save(rule);
    }

    @Transactional
    public void evaluatePriceRules(String symbol, BigDecimal currentPrice) {
        List<NotificationRule> rules = ruleRepository.findBySymbolAndActiveTrue(symbol);

        for (NotificationRule rule : rules) {
            boolean triggered = false;

            if ("GREATER_THAN".equalsIgnoreCase(rule.getConditionOperator()) && currentPrice.compareTo(rule.getTargetValue()) >= 0) {
                triggered = true;
            } else if ("LESS_THAN".equalsIgnoreCase(rule.getConditionOperator()) && currentPrice.compareTo(rule.getTargetValue()) <= 0) {
                triggered = true;
            }

            if (triggered) {
                log.info("Rule {} triggered for user {} on symbol {}", rule.getId(), rule.getUser().getId(), symbol);
                rule.setLastTriggeredAt(Instant.now());
                ruleRepository.save(rule);
            }
        }
    }
}
