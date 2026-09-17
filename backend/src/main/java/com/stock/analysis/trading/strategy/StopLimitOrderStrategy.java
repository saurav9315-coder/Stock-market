package com.stock.analysis.trading.strategy;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.OrderType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class StopLimitOrderStrategy implements OrderExecutionStrategy {

    @Override
    public OrderType getOrderType() {
        return OrderType.STOP_LIMIT;
    }

    @Override
    public boolean isEligibleForExecution(Order order, BigDecimal currentMarketPrice) {
        if (currentMarketPrice == null || order.getStopPrice() == null || order.getLimitPrice() == null) {
            return false;
        }

        if (order.getSide() == OrderSide.SELL) {
            // Triggered if price <= stop price, AND market price >= limit price
            boolean triggered = currentMarketPrice.compareTo(order.getStopPrice()) <= 0;
            boolean limitSatisfied = currentMarketPrice.compareTo(order.getLimitPrice()) >= 0;
            return triggered && limitSatisfied;
        } else {
            // Triggered if price >= stop price, AND market price <= limit price
            boolean triggered = currentMarketPrice.compareTo(order.getStopPrice()) >= 0;
            boolean limitSatisfied = currentMarketPrice.compareTo(order.getLimitPrice()) <= 0;
            return triggered && limitSatisfied;
        }
    }

    @Override
    public BigDecimal calculateExecutionPrice(Order order, BigDecimal currentMarketPrice) {
        if (order.getSide() == OrderSide.BUY) {
            return currentMarketPrice.min(order.getLimitPrice());
        } else {
            return currentMarketPrice.max(order.getLimitPrice());
        }
    }
}
