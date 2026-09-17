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
public class OrderStreamPayload {

    private UUID orderId;
    private UUID userId;
    private String symbol;
    private String orderType; // MARKET, LIMIT, STOP_LIMIT
    private String orderSide; // BUY, SELL
    private String status; // CREATED, PENDING, PARTIALLY_FILLED, FILLED, CANCELLED, REJECTED
    private BigDecimal totalQuantity;
    private BigDecimal filledQuantity;
    private BigDecimal price;
    private BigDecimal executionPrice;
    private String rejectionReason;
    private Instant updatedAt;
}
