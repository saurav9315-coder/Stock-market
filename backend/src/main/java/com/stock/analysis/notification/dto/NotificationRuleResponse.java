package com.stock.analysis.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRuleResponse {
    private UUID id;
    private UUID userId;
    private String ruleType;
    private String symbol;
    private BigDecimal targetValue;
    private String conditionOperator;
    private boolean active;
    private Instant lastTriggeredAt;
    private Instant createdAt;
}
