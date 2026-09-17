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
@Table(name = "profit_losses")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class ProfitLoss extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Builder.Default
    @Column(name = "realized_pl", nullable = false, precision = 18, scale = 4)
    private BigDecimal realizedPl = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "unrealized_pl", nullable = false, precision = 18, scale = 4)
    private BigDecimal unrealizedPl = BigDecimal.ZERO;
}
