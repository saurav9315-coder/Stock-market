package com.stock.analysis.wallet.event;

import com.stock.analysis.wallet.Wallet;

import java.math.BigDecimal;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class WalletBalanceUpdatedEvent extends ApplicationEvent {
    private final Wallet wallet;
    private final BigDecimal availableBalance;
    private final BigDecimal lockedBalance;

    public WalletBalanceUpdatedEvent(Object source, Wallet wallet, BigDecimal availableBalance, BigDecimal lockedBalance) {
        super(source);
        this.wallet = wallet;
        this.availableBalance = availableBalance;
        this.lockedBalance = lockedBalance;
    }
}
