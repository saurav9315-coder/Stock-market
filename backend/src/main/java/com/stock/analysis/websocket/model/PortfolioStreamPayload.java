package com.stock.analysis.websocket.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioStreamPayload {

    private UUID portfolioId;
    private UUID userId;
    private BigDecimal totalValue;
    private BigDecimal totalCostBasis;
    private BigDecimal unrealizedPnl;
    private BigDecimal unrealizedPnlPercentage;
    private BigDecimal realizedPnl;
    private int positionCount;
    private String triggerEvent; // PRICE_CHANGE, ORDER_EXECUTED, MANUAL_REBALANCE
}
