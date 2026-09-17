package com.stock.analysis.trading.dto;

import com.stock.analysis.trading.domain.DividendStatus;
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
public class DividendResponse {

    private UUID id;
    private UUID stockId;
    private String stockSymbol;
    private String stockName;
    private BigDecimal amountPerShare;
    private Instant exDate;
    private Instant recordDate;
    private Instant paymentDate;
    private DividendStatus status;
}
