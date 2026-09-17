package com.stock.analysis.wallet.event;

import com.stock.analysis.wallet.DepositRequest;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class DepositSubmittedEvent extends ApplicationEvent {
    private final DepositRequest depositRequest;

    public DepositSubmittedEvent(Object source, DepositRequest depositRequest) {
        super(source);
        this.depositRequest = depositRequest;
    }
}
