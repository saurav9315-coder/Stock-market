package com.stock.analysis.trading.strategy;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.OrderType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class TakeProfitOrderStrategy implements OrderExecutionStrategy {

    @Override
    public OrderType getOrderType() {
        return OrderType.TAKE_PROFIT;
    }

    @Override
    public boolean isEligibleForExecution(Order order, BigDecimal currentMarketPrice) {
        if (currentMarketPrice == null) {
            return false;
        }

        BigDecimal targetPrice = order.getTriggerPrice() != null ? order.getTriggerPrice() : order.getLimitPrice();
        if (targetPrice == null) {
            return false;
        }

        if (order.getSide() == OrderSide.SELL) {
            // Take profit sell triggers when market price rises to or above target price
            return currentMarketPrice.compareTo(targetPrice) >= 0;
        } else {
            // Take profit buy triggers when market price drops to or below target price
            return currentMarketPrice.compareTo(targetPrice) <= 0;
        }
    }

    @Override
    public BigDecimal calculateExecutionPrice(Order order, BigDecimal currentMarketPrice) {
        return currentMarketPrice;
    }
}
