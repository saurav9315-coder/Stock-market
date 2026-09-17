package com.stock.analysis.market;

import com.stock.analysis.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "live_prices_cache")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class LivePriceCache extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false, unique = true)
    private Stock stock;

    @Column(name = "price", nullable = false, precision = 18, scale = 4)
    private BigDecimal price;

    @Column(name = "change_amount", nullable = false, precision = 18, scale = 4)
    private BigDecimal changeAmount;

    @Column(name = "change_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal changePercent;

    @Column(name = "bid_price", precision = 18, scale = 4)
    private BigDecimal bidPrice;

    @Column(name = "ask_price", precision = 18, scale = 4)
    private BigDecimal askPrice;

    @Column(name = "volume", nullable = false)
    private Long volume;

    @Column(name = "last_updated_at", nullable = false)
    private Instant lastUpdatedAt;
}
