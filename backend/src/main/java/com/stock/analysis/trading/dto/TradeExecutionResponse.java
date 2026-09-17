package com.stock.analysis.trading.dto;

import com.stock.analysis.trading.domain.OrderSide;
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
public class TradeExecutionResponse {

    private UUID id;
    private String tradeNumber;
    private UUID buyOrderId;
    private UUID sellOrderId;
    private UUID stockId;
    private String stockSymbol;
    private String stockName;
    private OrderSide side;
    private TradingMode tradingMode;
    private BigDecimal quantity;
    private BigDecimal price;
    private BigDecimal totalValue;
    private BigDecimal fee;
    private Instant executedAt;
}
