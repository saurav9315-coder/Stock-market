package com.stock.analysis.analytics;

import com.stock.analysis.common.BaseEntity;
import com.stock.analysis.portfolio.Portfolio;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "portfolio_analytics")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class PortfolioAnalytic extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "total_value", nullable = false, precision = 18, scale = 4)
    private BigDecimal totalValue;

    @Column(name = "daily_return", nullable = false, precision = 18, scale = 4)
    private BigDecimal dailyReturn;

    @Column(name = "cumulative_return", nullable = false, precision = 18, scale = 4)
    private BigDecimal cumulativeReturn;

    @Column(name = "sharpe_ratio", precision = 6, scale = 4)
    private BigDecimal sharpeRatio;
}
