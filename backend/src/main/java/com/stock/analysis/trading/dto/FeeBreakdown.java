package com.stock.analysis.trading.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeBreakdown {

    private BigDecimal brokerageFee;
    private BigDecimal platformFee;
    private BigDecimal taxAmount;
    private BigDecimal gstAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalFee;
}
