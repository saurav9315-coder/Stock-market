package com.stock.analysis.trading.strategy;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.OrderType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class StopLossOrderStrategy implements OrderExecutionStrategy {

    @Override
    public OrderType getOrderType() {
        return OrderType.STOP_LOSS;
    }

    @Override
    public boolean isEligibleForExecution(Order order, BigDecimal currentMarketPrice) {
        if (currentMarketPrice == null || order.getStopPrice() == null) {
            return false;
        }

        if (order.getSide() == OrderSide.SELL) {
            // Stop loss sell triggers when price drops to or below stop price
            return currentMarketPrice.compareTo(order.getStopPrice()) <= 0;
        } else {
            // Stop loss buy triggers when price reaches or rises above stop price
            return currentMarketPrice.compareTo(order.getStopPrice()) >= 0;
        }
    }

    @Override
    public BigDecimal calculateExecutionPrice(Order order, BigDecimal currentMarketPrice) {
        return currentMarketPrice;
    }
}
