package com.stock.analysis.analytics;

import com.stock.analysis.common.BaseEntity;
import com.stock.analysis.market.Stock;
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
@Table(name = "market_analytics")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class MarketAnalytic extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "high_52w", precision = 18, scale = 4)
    private BigDecimal high52w;

    @Column(name = "low_52w", precision = 18, scale = 4)
    private BigDecimal low52w;

    @Column(name = "moving_avg_50d", precision = 18, scale = 4)
    private BigDecimal movingAvg50d;

    @Column(name = "moving_avg_200d", precision = 18, scale = 4)
    private BigDecimal movingAvg200d;

    @Column(name = "beta", precision = 6, scale = 4)
    private BigDecimal beta;

    @Column(name = "rsi", precision = 6, scale = 3)
    private BigDecimal rsi;
}
