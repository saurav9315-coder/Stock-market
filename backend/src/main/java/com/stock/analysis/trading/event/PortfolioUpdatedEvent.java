package com.stock.analysis.trading.event;

import com.stock.analysis.portfolio.Portfolio;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class PortfolioUpdatedEvent extends ApplicationEvent {

    private final Portfolio portfolio;

    public PortfolioUpdatedEvent(Object source, Portfolio portfolio) {
        super(source);
        this.portfolio = portfolio;
    }
}
