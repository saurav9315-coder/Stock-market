package com.stock.analysis.websocket.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletStreamPayload {

    private UUID walletId;
    private UUID userId;
    private BigDecimal availableBalance;
    private BigDecimal lockedBalance;
    private BigDecimal totalBalance;
    private String transactionType; // DEPOSIT_SUBMITTED, DEPOSIT_APPROVED, DEPOSIT_REJECTED, WITHDRAWAL_APPROVED, WITHDRAWAL_REJECTED, BALANCE_UPDATE
    private BigDecimal transactionAmount;
    private String referenceId;
    private String currency;
    private Instant timestamp;
}
