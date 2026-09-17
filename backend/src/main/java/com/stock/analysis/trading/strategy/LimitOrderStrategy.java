package com.stock.analysis.trading.strategy;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.OrderType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class LimitOrderStrategy implements OrderExecutionStrategy {

    @Override
    public OrderType getOrderType() {
        return OrderType.LIMIT;
    }

    @Override
    public boolean isEligibleForExecution(Order order, BigDecimal currentMarketPrice) {
        if (currentMarketPrice == null || order.getLimitPrice() == null) {
            return false;
        }

        if (order.getSide() == OrderSide.BUY) {
            // Buy limit executes if market price is <= limit price
            return currentMarketPrice.compareTo(order.getLimitPrice()) <= 0;
        } else {
            // Sell limit executes if market price is >= limit price
            return currentMarketPrice.compareTo(order.getLimitPrice()) >= 0;
        }
    }

    @Override
    public BigDecimal calculateExecutionPrice(Order order, BigDecimal currentMarketPrice) {
        // Execute at limit price or better market price
        if (order.getSide() == OrderSide.BUY) {
            return currentMarketPrice.min(order.getLimitPrice());
        } else {
            return currentMarketPrice.max(order.getLimitPrice());
        }
    }
}
