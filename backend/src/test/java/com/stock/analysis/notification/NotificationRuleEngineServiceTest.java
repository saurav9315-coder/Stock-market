package com.stock.analysis.notification;

import com.stock.analysis.notification.domain.NotificationRule;
import com.stock.analysis.notification.dto.NotificationRuleRequest;
import com.stock.analysis.notification.dto.NotificationRuleResponse;
import com.stock.analysis.notification.mapper.NotificationMapper;
import com.stock.analysis.notification.repository.NotificationRuleRepository;
import com.stock.analysis.notification.service.NotificationRuleEngineService;
import com.stock.analysis.users.User;
import com.stock.analysis.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationRuleEngineServiceTest {

    @Mock
    private NotificationRuleRepository ruleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationMapper notificationMapper;

    @InjectMocks
    private NotificationRuleEngineService ruleEngineService;

    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = User.builder().id(userId).username("trader1").build();
    }

    @Test
    @DisplayName("Should create custom alert rule successfully")
    void testCreateRuleSuccess() {
        NotificationRuleRequest request = NotificationRuleRequest.builder()
                .ruleType("PRICE_ALERT")
                .symbol("AAPL")
                .targetValue(new BigDecimal("180.00"))
                .conditionOperator("GREATER_THAN")
                .active(true)
                .build();

        NotificationRule rule = NotificationRule.builder()
                .id(UUID.randomUUID())
                .user(user)
                .ruleType("PRICE_ALERT")
                .symbol("AAPL")
                .targetValue(new BigDecimal("180.00"))
                .conditionOperator("GREATER_THAN")
                .active(true)
                .build();

        NotificationRuleResponse responseDto = NotificationRuleResponse.builder()
                .id(rule.getId())
                .userId(userId)
                .ruleType("PRICE_ALERT")
                .symbol("AAPL")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(ruleRepository.save(any(NotificationRule.class))).thenReturn(rule);
        when(notificationMapper.toRuleResponse(rule)).thenReturn(responseDto);

        NotificationRuleResponse result = ruleEngineService.createRule(userId, request);

        assertThat(result).isNotNull();
        assertThat(result.getSymbol()).isEqualTo("AAPL");
    }

    @Test
    @DisplayName("Should evaluate price alert rules correctly when threshold is exceeded")
    void testEvaluatePriceRulesTriggered() {
        NotificationRule rule = NotificationRule.builder()
                .id(UUID.randomUUID())
                .user(user)
                .symbol("AAPL")
                .targetValue(new BigDecimal("150.00"))
                .conditionOperator("GREATER_THAN")
                .active(true)
                .build();

        when(ruleRepository.findBySymbolAndActiveTrue("AAPL")).thenReturn(List.of(rule));

        ruleEngineService.evaluatePriceRules("AAPL", new BigDecimal("155.00"));

        verify(ruleRepository, times(1)).save(rule);
        assertThat(rule.getLastTriggeredAt()).isNotNull();
    }
}
