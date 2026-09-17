package com.stock.analysis.notification.domain;

import com.stock.analysis.common.BaseEntity;
import com.stock.analysis.users.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "notification_rules")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "rule_type", nullable = false, length = 50)
    private String ruleType;

    @Column(name = "symbol", length = 20)
    private String symbol;

    @Column(name = "target_value", precision = 19, scale = 4)
    private BigDecimal targetValue;

    @Column(name = "condition_operator", nullable = false, length = 20)
    private String conditionOperator; // GREATER_THAN, LESS_THAN, PERCENT_CHANGE_ABOVE, PERCENT_LOSS_ABOVE

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "last_triggered_at")
    private Instant lastTriggeredAt;
}
