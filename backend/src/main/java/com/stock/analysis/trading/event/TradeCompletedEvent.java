package com.stock.analysis.trading.event;

import com.stock.analysis.trading.entity.TradeExecution;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class TradeCompletedEvent extends ApplicationEvent {

    private final TradeExecution tradeExecution;

    public TradeCompletedEvent(Object source, TradeExecution tradeExecution) {
        super(source);
        this.tradeExecution = tradeExecution;
    }
}
