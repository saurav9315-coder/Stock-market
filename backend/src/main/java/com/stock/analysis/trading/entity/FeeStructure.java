package com.stock.analysis.trading.entity;

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

@Entity
@Table(name = "fee_structures")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class FeeStructure extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "brokerage_rate_pct", nullable = false, precision = 8, scale = 4)
    @Builder.Default
    private BigDecimal brokerageRatePct = new BigDecimal("0.0010"); // 0.1%

    @Column(name = "platform_fee_flat", nullable = false, precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal platformFeeFlat = new BigDecimal("1.0000"); // $1.00

    @Column(name = "tax_rate_pct", nullable = false, precision = 8, scale = 4)
    @Builder.Default
    private BigDecimal taxRatePct = new BigDecimal("0.0005"); // 0.05%

    @Column(name = "gst_rate_pct", nullable = false, precision = 8, scale = 4)
    @Builder.Default
    private BigDecimal gstRatePct = new BigDecimal("0.1800"); // 18%

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "trading_mode", nullable = false, length = 10)
    @Builder.Default
    private String tradingMode = "ALL";
}
