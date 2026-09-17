package com.stock.analysis.trading.strategy;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.domain.OrderType;

import java.math.BigDecimal;

public interface OrderExecutionStrategy {

    OrderType getOrderType();

    boolean isEligibleForExecution(Order order, BigDecimal currentMarketPrice);

    BigDecimal calculateExecutionPrice(Order order, BigDecimal currentMarketPrice);
}
