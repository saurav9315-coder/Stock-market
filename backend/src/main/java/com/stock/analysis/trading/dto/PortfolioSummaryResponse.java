package com.stock.analysis.trading.dto;

import com.stock.analysis.trading.domain.TradingMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioSummaryResponse {

    private UUID portfolioId;
    private String portfolioName;
    private TradingMode tradingMode;
    private BigDecimal cashBalance;
    private BigDecimal lockedBalance;
    private BigDecimal totalCostBasis;
    private BigDecimal holdingsMarketValue;
    private BigDecimal totalPortfolioValue;
    private BigDecimal unrealizedPnL;
    private BigDecimal unrealizedPnLPercentage;
    private BigDecimal totalRealizedPnL;
    private BigDecimal totalReturnPct;
    private BigDecimal dailyReturnPct;
    private List<HoldingResponse> holdings;
}
