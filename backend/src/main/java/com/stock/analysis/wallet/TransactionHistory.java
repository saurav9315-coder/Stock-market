package com.stock.analysis.wallet;

import com.stock.analysis.common.BaseEntity;
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
import java.util.UUID;

@Entity
@Table(name = "transaction_histories")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class TransactionHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @Column(name = "type", nullable = false, length = 20)
    private String type; // DEPOSIT, WITHDRAWAL, TRADE_BUY, TRADE_SELL, FEE

    @Column(name = "amount", nullable = false, precision = 18, scale = 4)
    private BigDecimal amount;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // PENDING, COMPLETED, FAILED, CANCELLED

    @Builder.Default
    @Column(name = "fee", nullable = false, precision = 18, scale = 4)
    private BigDecimal fee = BigDecimal.ZERO;

    @Column(name = "reference_type", length = 50)
    private String referenceType; // DEPOSIT_REQUEST, WITHDRAWAL_REQUEST, ORDER

    @Column(name = "reference_id")
    private UUID referenceId;
}
