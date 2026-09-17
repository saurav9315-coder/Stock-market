package com.stock.analysis.trading.event;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.entity.TradeExecution;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class OrderExecutedEvent extends ApplicationEvent {

    private final Order order;
    private final TradeExecution execution;

    public OrderExecutedEvent(Object source, Order order, TradeExecution execution) {
        super(source);
        this.order = order;
        this.execution = execution;
    }
}
