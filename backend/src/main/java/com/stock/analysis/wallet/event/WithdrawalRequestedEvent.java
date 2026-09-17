package com.stock.analysis.wallet.event;

import com.stock.analysis.wallet.WithdrawalRequest;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class WithdrawalRequestedEvent extends ApplicationEvent {
    private final WithdrawalRequest withdrawalRequest;

    public WithdrawalRequestedEvent(Object source, WithdrawalRequest withdrawalRequest) {
        super(source);
        this.withdrawalRequest = withdrawalRequest;
    }
}
