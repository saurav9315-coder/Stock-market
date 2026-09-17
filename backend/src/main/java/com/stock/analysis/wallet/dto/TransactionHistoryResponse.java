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
public class TransactionHistoryResponse {
    private UUID id;
    private UUID walletId;
    private String type; // DEPOSIT, WITHDRAWAL, BUY, SELL, REFUND, ADJUSTMENT, FEE, DIVIDEND
    private BigDecimal amount;
    private String status; // PENDING, COMPLETED, FAILED, CANCELLED
    private BigDecimal fee;
    private String referenceType;
    private UUID referenceId;
    private Instant createdAt;
}
