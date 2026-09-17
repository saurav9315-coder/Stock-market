package com.stock.analysis.trading.event;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.portfolio.Portfolio;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.entity.TradeExecution;
import com.stock.analysis.wallet.Wallet;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class TradingEventPublisher {

    private final ApplicationEventPublisher eventPublisher;

    public void publishOrderCreated(Order order) {
        log.info("Publishing OrderCreatedEvent for orderId={}", order.getId());
        eventPublisher.publishEvent(new OrderCreatedEvent(this, order));
    }

    public void publishOrderExecuted(Order order, TradeExecution execution) {
        log.info("Publishing OrderExecutedEvent for orderId={}, tradeNumber={}", order.getId(), execution.getTradeNumber());
        eventPublisher.publishEvent(new OrderExecutedEvent(this, order, execution));
    }

    public void publishOrderCancelled(Order order, String reason) {
        log.info("Publishing OrderCancelledEvent for orderId={}, reason={}", order.getId(), reason);
        eventPublisher.publishEvent(new OrderCancelledEvent(this, order, reason));
    }

    public void publishPortfolioUpdated(Portfolio portfolio) {
        log.info("Publishing PortfolioUpdatedEvent for portfolioId={}", portfolio.getId());
        eventPublisher.publishEvent(new PortfolioUpdatedEvent(this, portfolio));
    }

    public void publishWalletUpdated(Wallet wallet, TradingMode tradingMode, BigDecimal newAvailableBalance) {
        log.info("Publishing WalletUpdatedEvent for walletId={}, mode={}, newAvailableBalance={}", wallet.getId(), tradingMode, newAvailableBalance);
        eventPublisher.publishEvent(new WalletUpdatedEvent(this, wallet, tradingMode, newAvailableBalance));
    }

    public void publishTradeCompleted(TradeExecution execution) {
        log.info("Publishing TradeCompletedEvent for tradeId={}", execution.getId());
        eventPublisher.publishEvent(new TradeCompletedEvent(this, execution));
    }
}
