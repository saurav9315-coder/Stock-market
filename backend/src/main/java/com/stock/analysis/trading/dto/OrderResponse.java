package com.stock.analysis.trading.dto;

import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.OrderStatus;
import com.stock.analysis.trading.domain.OrderType;
import com.stock.analysis.trading.domain.TradingMode;
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
public class OrderResponse {

    private UUID id;
    private UUID userId;
    private String username;
    private UUID portfolioId;
    private UUID stockId;
    private String stockSymbol;
    private String stockName;
    private TradingMode tradingMode;
    private OrderSide side;
    private OrderType orderType;
    private OrderStatus status;
    private BigDecimal quantity;
    private BigDecimal filledQuantity;
    private BigDecimal limitPrice;
    private BigDecimal stopPrice;
    private BigDecimal triggerPrice;
    private BigDecimal avgFillPrice;
    private BigDecimal totalFee;
    private BigDecimal totalAmount;
    private String clientOrderId;
    private String cancelledReason;
    private String rejectedReason;
    private Instant expiresAt;
    private Instant createdAt;
    private Instant filledAt;
    private Instant cancelledAt;
}
