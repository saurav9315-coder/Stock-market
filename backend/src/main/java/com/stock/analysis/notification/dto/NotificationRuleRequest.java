package com.stock.analysis.notification.dto;

import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRuleRequest {
    @NotBlank(message = "Rule type is required")
    private String ruleType;

    private String symbol;

    private BigDecimal targetValue;

    @NotBlank(message = "Condition operator is required")
    private String conditionOperator;

    @Builder.Default
    private boolean active = true;
}
