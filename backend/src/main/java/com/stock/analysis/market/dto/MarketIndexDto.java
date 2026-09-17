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
public class MarketIndexDto {
    private String name;
    private String symbol;
    private BigDecimal value;
    private BigDecimal changeAmount;
    private BigDecimal changePercent;
    private Instant lastUpdatedAt;
}
