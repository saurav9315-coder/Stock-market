package com.stock.analysis.trading.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;

import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TradingEventListener {

    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("EVENT LOGGED: Order created - OrderId={}, Symbol={}, Mode={}, Side={}, Type={}",
                event.getOrder().getId(),
                event.getOrder().getStock().getSymbol(),
                event.getOrder().getTradingMode(),
                event.getOrder().getSide(),
                event.getOrder().getOrderType());
    }

    @EventListener
    public void handleOrderExecuted(OrderExecutedEvent event) {
        log.info("EVENT LOGGED: Order executed - OrderId={}, FillPrice={}, Qty={}",
                event.getOrder().getId(),
                event.getExecution().getPrice(),
                event.getExecution().getQuantity());
    }

    @EventListener
    public void handleOrderCancelled(OrderCancelledEvent event) {
        log.info("EVENT LOGGED: Order cancelled - OrderId={}, Reason={}",
                event.getOrder().getId(),
                event.getReason());
    }

    @EventListener
    public void handlePortfolioUpdated(PortfolioUpdatedEvent event) {
        log.info("EVENT LOGGED: Portfolio updated - PortfolioId={}, Mode={}",
                event.getPortfolio().getId(),
                event.getPortfolio().getTradingMode());
    }

    @EventListener
    public void handleWalletUpdated(WalletUpdatedEvent event) {
        log.info("EVENT LOGGED: Wallet updated - WalletId={}, Mode={}, NewBalance={}",
                event.getWallet().getId(),
                event.getTradingMode(),
                event.getNewAvailableBalance());
    }

    @EventListener
    public void handleTradeCompleted(TradeCompletedEvent event) {
        log.info("EVENT LOGGED: Trade completed - TradeNumber={}, TotalValue={}",
                event.getTradeExecution().getTradeNumber(),
                event.getTradeExecution().getTotalValue());
    }
}
