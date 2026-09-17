package com.stock.analysis.market;

import com.stock.analysis.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;

@Entity
@Table(name = "market_indices")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class MarketIndex extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "symbol", nullable = false, unique = true, length = 20)
    private String symbol;

    @Column(name = "`value`", nullable = false, precision = 18, scale = 4)
    private BigDecimal value;

    @Column(name = "change_amount", nullable = false, precision = 18, scale = 4)
    private BigDecimal changeAmount;

    @Column(name = "change_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal changePercent;
}
