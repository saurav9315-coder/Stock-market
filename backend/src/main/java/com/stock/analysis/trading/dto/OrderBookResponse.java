package com.stock.analysis.trading.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderBookResponse {

    private String symbol;
    private List<OrderBookLevelDto> bids;
    private List<OrderBookLevelDto> asks;
    private Instant lastUpdated;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderBookLevelDto {
        private BigDecimal price;
        private BigDecimal quantity;
        private int orderCount;
    }
}
