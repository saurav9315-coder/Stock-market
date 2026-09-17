package com.stock.analysis.trading.dto;

import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.OrderType;
import com.stock.analysis.trading.domain.TradingMode;
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
public class OrderCreateRequest {

    @NotBlank(message = "Stock symbol is required")
    private String symbol;

    @NotNull(message = "Order side (BUY/SELL) is required")
    private OrderSide side;

    @NotNull(message = "Order type is required")
    private OrderType orderType;

    @Builder.Default
    private TradingMode tradingMode = TradingMode.DEMO;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.000001", message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    @DecimalMin(value = "0.0001", message = "Limit price must be greater than zero")
    private BigDecimal limitPrice;

    @DecimalMin(value = "0.0001", message = "Stop price must be greater than zero")
    private BigDecimal stopPrice;

    @DecimalMin(value = "0.0001", message = "Trigger price must be greater than zero")
    private BigDecimal triggerPrice;

    private String clientOrderId;

    private Instant expiresAt;
}
