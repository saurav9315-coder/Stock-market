package com.stock.analysis.market.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockDto {
    private UUID id;
    private String symbol;
    private String name;
    private String exchangeCode;
    private boolean active;
}
