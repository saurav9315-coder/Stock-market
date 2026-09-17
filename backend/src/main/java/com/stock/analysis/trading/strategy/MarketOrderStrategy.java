package com.stock.analysis.trading.strategy;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.domain.OrderType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class MarketOrderStrategy implements OrderExecutionStrategy {

    @Override
    public OrderType getOrderType() {
        return OrderType.MARKET;
    }

    @Override
    public boolean isEligibleForExecution(Order order, BigDecimal currentMarketPrice) {
        return currentMarketPrice != null && currentMarketPrice.compareTo(BigDecimal.ZERO) > 0;
    }

    @Override
    public BigDecimal calculateExecutionPrice(Order order, BigDecimal currentMarketPrice) {
        return currentMarketPrice;
    }
}
