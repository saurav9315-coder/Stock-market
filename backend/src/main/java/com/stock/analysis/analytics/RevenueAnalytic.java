package com.stock.analysis.analytics;

import com.stock.analysis.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "revenue_analytics")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class RevenueAnalytic extends BaseEntity {

    @Column(name = "date", nullable = false, unique = true)
    private LocalDate date;

    @Builder.Default
    @Column(name = "trading_fees", nullable = false, precision = 18, scale = 4)
    private BigDecimal tradingFees = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "subscription_revenue", nullable = false, precision = 18, scale = 4)
    private BigDecimal subscriptionRevenue = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "other_revenue", nullable = false, precision = 18, scale = 4)
    private BigDecimal otherRevenue = BigDecimal.ZERO;
}
