package com.stock.analysis.trading.service;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.dto.FeeBreakdown;
import com.stock.analysis.trading.entity.TradeExecution;

import java.math.BigDecimal;

public interface SettlementService {

    TradeExecution settleTrade(Order order, BigDecimal fillQuantity, BigDecimal fillPrice, FeeBreakdown feeBreakdown);
}
