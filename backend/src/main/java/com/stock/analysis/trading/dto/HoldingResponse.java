package com.stock.analysis.trading.dto;

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
public class HoldingResponse {

    private UUID holdingId;
    private UUID stockId;
    private String stockSymbol;
    private String stockName;
    private BigDecimal quantity;
    private BigDecimal averageBuyPrice;
    private BigDecimal currentPrice;
    private BigDecimal marketValue;
    private BigDecimal totalCostBasis;
    private BigDecimal unrealizedPnL;
    private BigDecimal unrealizedPnLPercentage;
    private BigDecimal realizedPnL;
}
