package com.stock.analysis.portfolio;

import com.stock.analysis.common.BaseEntity;
import com.stock.analysis.market.Stock;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;

@Entity
@Table(name = "holdings")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class Holding extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Column(name = "quantity", nullable = false, precision = 18, scale = 6)
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "average_buy_price", nullable = false, precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal averageBuyPrice = BigDecimal.ZERO;

    @Column(name = "total_cost_basis", nullable = false, precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal totalCostBasis = BigDecimal.ZERO;

    @Column(name = "realized_pnl", nullable = false, precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal realizedPnl = BigDecimal.ZERO;
}
