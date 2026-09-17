package com.stock.analysis.wallet.event;

import com.stock.analysis.wallet.DepositRequest;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class DepositApprovedEvent extends ApplicationEvent {
    private final DepositRequest depositRequest;

    public DepositApprovedEvent(Object source, DepositRequest depositRequest) {
        super(source);
        this.depositRequest = depositRequest;
    }
}
