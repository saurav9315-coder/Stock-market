package com.stock.analysis.trading.service;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.entity.TradeExecution;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface ExecutionService {

    TradeExecution executeOrder(Order order, BigDecimal currentMarketPrice);

    List<TradeExecution> processPendingOrdersForStock(UUID stockId, BigDecimal currentMarketPrice, TradingMode tradingMode);
}
