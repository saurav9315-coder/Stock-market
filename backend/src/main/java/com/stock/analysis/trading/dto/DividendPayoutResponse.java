package com.stock.analysis.trading.dto;

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
public class DividendPayoutResponse {

    private UUID id;
    private UUID dividendId;
    private String stockSymbol;
    private String stockName;
    private TradingMode tradingMode;
    private BigDecimal sharesHeld;
    private BigDecimal grossAmount;
    private BigDecimal taxDeducted;
    private BigDecimal netAmount;
    private Instant paidAt;
}
