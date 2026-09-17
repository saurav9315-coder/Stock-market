package com.stock.analysis.wallet.dto;

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
public class WalletLedgerResponse {
    private UUID id;
    private UUID walletId;
    private BigDecimal amount;
    private String type; // DEBIT, CREDIT
    private BigDecimal balanceAfter;
    private String description;
    private UUID referenceId;
    private Instant createdAt;
}
