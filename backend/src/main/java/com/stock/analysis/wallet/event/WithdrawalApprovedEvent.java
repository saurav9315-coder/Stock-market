package com.stock.analysis.wallet.event;

import com.stock.analysis.wallet.WithdrawalRequest;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class WithdrawalApprovedEvent extends ApplicationEvent {
    private final WithdrawalRequest withdrawalRequest;

    public WithdrawalApprovedEvent(Object source, WithdrawalRequest withdrawalRequest) {
        super(source);
        this.withdrawalRequest = withdrawalRequest;
    }
}
