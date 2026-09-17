package com.stock.analysis.trading.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DividendRequest {

    @NotBlank(message = "Stock symbol is required")
    private String symbol;

    @NotNull(message = "Amount per share is required")
    @DecimalMin(value = "0.0001", message = "Amount per share must be positive")
    private BigDecimal amountPerShare;

    @NotNull(message = "Ex-date is required")
    private Instant exDate;

    @NotNull(message = "Record date is required")
    private Instant recordDate;

    @NotNull(message = "Payment date is required")
    private Instant paymentDate;
}
