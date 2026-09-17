package com.stock.analysis.trading.service;

import com.stock.analysis.portfolio.Holding;
import com.stock.analysis.portfolio.Order;
import com.stock.analysis.portfolio.Portfolio;
import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.FeeBreakdown;
import com.stock.analysis.trading.entity.TradeExecution;
import com.stock.analysis.trading.event.TradingEventPublisher;
import com.stock.analysis.trading.repository.HoldingRepository;
import com.stock.analysis.trading.repository.PortfolioRepository;
import com.stock.analysis.trading.repository.TradeExecutionRepository;
import com.stock.analysis.trading.repository.TransactionHistoryRepository;
import com.stock.analysis.trading.repository.WalletBalanceRepository;
import com.stock.analysis.wallet.TransactionHistory;
import com.stock.analysis.wallet.Wallet;
import com.stock.analysis.wallet.WalletBalance;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettlementServiceImpl implements SettlementService {

    private final WalletBalanceRepository walletBalanceRepository;
    private final HoldingRepository holdingRepository;
    private final PortfolioRepository portfolioRepository;
    private final TradeExecutionRepository tradeExecutionRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final TradingEventPublisher eventPublisher;

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TradeExecution settleTrade(Order order, BigDecimal fillQuantity, BigDecimal fillPrice, FeeBreakdown feeBreakdown) {
        log.info("Settling trade for orderId={}, symbol={}, quantity={}, price={}, mode={}",
                order.getId(), order.getStock().getSymbol(), fillQuantity, fillPrice, order.getTradingMode());

        BigDecimal grossTradeValue = fillQuantity.multiply(fillPrice).setScale(4, RoundingMode.HALF_UP);
        BigDecimal totalFee = feeBreakdown != null ? feeBreakdown.getTotalFee() : BigDecimal.ZERO;

        WalletBalance walletBalance = walletBalanceRepository.findByWalletUserId(order.getUser().getId())
                .orElseThrow(() -> new IllegalStateException("Wallet not found for user: " + order.getUser().getId()));

        Portfolio portfolio = order.getPortfolio();
        Holding holding = holdingRepository.findByPortfolioIdAndStockId(portfolio.getId(), order.getStock().getId())
                .orElseGet(() -> Holding.builder()
                        .portfolio(portfolio)
                        .stock(order.getStock())
                        .quantity(BigDecimal.ZERO)
                        .averageBuyPrice(BigDecimal.ZERO)
                        .totalCostBasis(BigDecimal.ZERO)
                        .realizedPnl(BigDecimal.ZERO)
                        .createdBy("SYSTEM")
                        .build());

        if (order.getSide() == OrderSide.BUY) {
            settleBuyOrder(order, walletBalance, holding, portfolio, fillQuantity, fillPrice, grossTradeValue, totalFee);
        } else {
            settleSellOrder(order, walletBalance, holding, portfolio, fillQuantity, fillPrice, grossTradeValue, totalFee);
        }

        // Create TradeExecution immutable record
        String tradeNumber = "TRD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        TradeExecution execution = TradeExecution.builder()
                .tradeNumber(tradeNumber)
                .buyOrder(order.getSide() == OrderSide.BUY ? order : null)
                .sellOrder(order.getSide() == OrderSide.SELL ? order : null)
                .user(order.getUser())
                .stock(order.getStock())
                .portfolio(portfolio)
                .tradingMode(order.getTradingMode())
                .side(order.getSide())
                .quantity(fillQuantity)
                .price(fillPrice)
                .totalValue(grossTradeValue)
                .fee(totalFee)
                .executedAt(Instant.now())
                .createdBy(order.getUser().getUsername())
                .build();

        TradeExecution savedExecution = tradeExecutionRepository.save(execution);

        // Record Financial Transaction History
        recordTransactionHistory(walletBalance.getWallet(), order.getSide() == OrderSide.BUY ? "TRADE_BUY" : "TRADE_SELL", grossTradeValue, totalFee, order.getId());

        // Publish events
        eventPublisher.publishTradeCompleted(savedExecution);
        eventPublisher.publishPortfolioUpdated(portfolio);

        return savedExecution;
    }

    private void settleBuyOrder(Order order, WalletBalance walletBalance, Holding holding, Portfolio portfolio,
                               BigDecimal fillQuantity, BigDecimal fillPrice, BigDecimal grossTradeValue, BigDecimal totalFee) {
        BigDecimal actualNetCost = grossTradeValue.add(totalFee);
        BigDecimal reservedAmount = (order.getTotalAmount() != null && order.getTotalAmount().compareTo(BigDecimal.ZERO) > 0)
                ? order.getTotalAmount()
                : actualNetCost;

        // Unlock reserved funds & apply net cost
        if (order.getTradingMode() == TradingMode.DEMO) {
            BigDecimal currentLocked = walletBalance.getDemoLockedBalance();
            BigDecimal unlockAmount = currentLocked.min(reservedAmount);
            walletBalance.setDemoLockedBalance(currentLocked.subtract(unlockAmount).max(BigDecimal.ZERO));

            BigDecimal refundOrAdjust = reservedAmount.subtract(actualNetCost);
            walletBalance.setDemoAvailableBalance(walletBalance.getDemoAvailableBalance().add(refundOrAdjust));

            eventPublisher.publishWalletUpdated(walletBalance.getWallet(), TradingMode.DEMO, walletBalance.getDemoAvailableBalance());
        } else {
            BigDecimal currentLocked = walletBalance.getLockedBalance();
            BigDecimal unlockAmount = currentLocked.min(reservedAmount);
            walletBalance.setLockedBalance(currentLocked.subtract(unlockAmount).max(BigDecimal.ZERO));

            BigDecimal refundOrAdjust = reservedAmount.subtract(actualNetCost);
            walletBalance.setAvailableBalance(walletBalance.getAvailableBalance().add(refundOrAdjust));

            eventPublisher.publishWalletUpdated(walletBalance.getWallet(), TradingMode.LIVE, walletBalance.getAvailableBalance());
        }
        walletBalanceRepository.save(walletBalance);

        // Holding Weighted Average Buy Price Calculation
        BigDecimal oldQuantity = holding.getQuantity();
        BigDecimal oldAvgBuyPrice = holding.getAverageBuyPrice();
        BigDecimal oldCostBasis = oldQuantity.multiply(oldAvgBuyPrice);
        BigDecimal newCostBasis = oldCostBasis.add(grossTradeValue);

        BigDecimal newQuantity = oldQuantity.add(fillQuantity);
        BigDecimal newAvgBuyPrice = newCostBasis.divide(newQuantity, 4, RoundingMode.HALF_UP);

        holding.setQuantity(newQuantity);
        holding.setAverageBuyPrice(newAvgBuyPrice);
        holding.setTotalCostBasis(newCostBasis);
        holdingRepository.save(holding);

        portfolio.setTotalInvested(portfolio.getTotalInvested().add(grossTradeValue));
        portfolioRepository.save(portfolio);
    }

    private void settleSellOrder(Order order, WalletBalance walletBalance, Holding holding, Portfolio portfolio,
                                BigDecimal fillQuantity, BigDecimal fillPrice, BigDecimal grossTradeValue, BigDecimal totalFee) {
        BigDecimal netProceeds = grossTradeValue.subtract(totalFee);

        // Credit proceeds to wallet available balance
        if (order.getTradingMode() == TradingMode.DEMO) {
            walletBalance.setDemoAvailableBalance(walletBalance.getDemoAvailableBalance().add(netProceeds));
            eventPublisher.publishWalletUpdated(walletBalance.getWallet(), TradingMode.DEMO, walletBalance.getDemoAvailableBalance());
        } else {
            walletBalance.setAvailableBalance(walletBalance.getAvailableBalance().add(netProceeds));
            eventPublisher.publishWalletUpdated(walletBalance.getWallet(), TradingMode.LIVE, walletBalance.getAvailableBalance());
        }
        walletBalanceRepository.save(walletBalance);

        // Compute Realized PnL for sold shares
        BigDecimal avgBuyPrice = holding.getAverageBuyPrice();
        BigDecimal costBasisOfSoldShares = fillQuantity.multiply(avgBuyPrice).setScale(4, RoundingMode.HALF_UP);
        BigDecimal tradeRealizedPnL = grossTradeValue.subtract(costBasisOfSoldShares).subtract(totalFee).setScale(4, RoundingMode.HALF_UP);

        BigDecimal newQuantity = holding.getQuantity().subtract(fillQuantity).max(BigDecimal.ZERO);
        holding.setQuantity(newQuantity);
        holding.setRealizedPnl(holding.getRealizedPnl().add(tradeRealizedPnL));
        holding.setTotalCostBasis(newQuantity.multiply(avgBuyPrice).setScale(4, RoundingMode.HALF_UP));
        holdingRepository.save(holding);

        portfolio.setTotalRealizedPnl(portfolio.getTotalRealizedPnl().add(tradeRealizedPnL));
        portfolioRepository.save(portfolio);
    }

    private void recordTransactionHistory(Wallet wallet, String type, BigDecimal amount, BigDecimal fee, UUID orderId) {
        TransactionHistory history = TransactionHistory.builder()
                .wallet(wallet)
                .type(type)
                .amount(amount)
                .fee(fee)
                .status("COMPLETED")
                .referenceType("ORDER")
                .referenceId(orderId)
                .createdBy("SYSTEM")
                .build();
        transactionHistoryRepository.save(history);
    }
}
