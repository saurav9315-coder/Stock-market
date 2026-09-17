package com.stock.analysis.market.dto;

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
public class LivePriceDto {
    private String symbol;
    private BigDecimal price;
    private BigDecimal changeAmount;
    private BigDecimal changePercent;
    private BigDecimal open;
    private BigDecimal high;
    private BigDecimal low;
    private BigDecimal previousClose;
    private BigDecimal bid;
    private BigDecimal ask;
    private Long volume;
    private Instant lastUpdatedAt;
    
    // Additional real-time statistics
    private Long marketCap;
    private BigDecimal fiftyTwoWeekHigh;
    private BigDecimal fiftyTwoWeekLow;
    private BigDecimal peRatio;
    private BigDecimal eps;
    private BigDecimal dividendYield;
}
