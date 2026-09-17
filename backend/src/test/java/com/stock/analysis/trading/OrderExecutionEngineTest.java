package com.stock.analysis.trading;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.OrderType;
import com.stock.analysis.trading.strategy.LimitOrderStrategy;
import com.stock.analysis.trading.strategy.MarketOrderStrategy;
import com.stock.analysis.trading.strategy.StopLossOrderStrategy;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OrderExecutionEngineTest {

    private final MarketOrderStrategy marketStrategy = new MarketOrderStrategy();
    private final LimitOrderStrategy limitStrategy = new LimitOrderStrategy();
    private final StopLossOrderStrategy stopLossStrategy = new StopLossOrderStrategy();

    @Test
    void marketOrder_AlwaysEligibleWhenMarketPricePresent() {
        Order order = Order.builder().orderType(OrderType.MARKET).side(OrderSide.BUY).build();
        assertTrue(marketStrategy.isEligibleForExecution(order, new BigDecimal("150.00")));
    }

    @Test
    void limitBuyOrder_EligibleWhenMarketPriceAtOrBelowLimit() {
        Order order = Order.builder()
                .orderType(OrderType.LIMIT)
                .side(OrderSide.BUY)
                .limitPrice(new BigDecimal("100.00"))
                .build();

        assertTrue(limitStrategy.isEligibleForExecution(order, new BigDecimal("99.50")));
        assertTrue(limitStrategy.isEligibleForExecution(order, new BigDecimal("100.00")));
        assertFalse(limitStrategy.isEligibleForExecution(order, new BigDecimal("100.50")));
    }

    @Test
    void stopLossSellOrder_EligibleWhenMarketPriceAtOrBelowStop() {
        Order order = Order.builder()
                .orderType(OrderType.STOP_LOSS)
                .side(OrderSide.SELL)
                .stopPrice(new BigDecimal("80.00"))
                .build();

        assertTrue(stopLossStrategy.isEligibleForExecution(order, new BigDecimal("79.00")));
        assertTrue(stopLossStrategy.isEligibleForExecution(order, new BigDecimal("80.00")));
        assertFalse(stopLossStrategy.isEligibleForExecution(order, new BigDecimal("81.00")));
    }
}
