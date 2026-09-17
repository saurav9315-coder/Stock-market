package com.stock.analysis.trading.event;

import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.wallet.Wallet;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.math.BigDecimal;

@Getter
public class WalletUpdatedEvent extends ApplicationEvent {

    private final Wallet wallet;
    private final TradingMode tradingMode;
    private final BigDecimal newAvailableBalance;

    public WalletUpdatedEvent(Object source, Wallet wallet, TradingMode tradingMode, BigDecimal newAvailableBalance) {
        super(source);
        this.wallet = wallet;
        this.tradingMode = tradingMode;
        this.newAvailableBalance = newAvailableBalance;
    }
}
