package com.stock.analysis.wallet;

import com.stock.analysis.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
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
@Table(name = "wallet_balances")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class WalletBalance extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false, unique = true)
    private Wallet wallet;

    @Builder.Default
    @Column(name = "available_balance", nullable = false, precision = 18, scale = 4)
    private BigDecimal availableBalance = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "locked_balance", nullable = false, precision = 18, scale = 4)
    private BigDecimal lockedBalance = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "demo_available_balance", nullable = false, precision = 18, scale = 4)
    private BigDecimal demoAvailableBalance = new BigDecimal("100000.0000");

    @Builder.Default
    @Column(name = "demo_locked_balance", nullable = false, precision = 18, scale = 4)
    private BigDecimal demoLockedBalance = BigDecimal.ZERO;
}
