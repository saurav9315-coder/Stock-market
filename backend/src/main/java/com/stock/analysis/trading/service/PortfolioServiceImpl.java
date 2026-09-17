package com.stock.analysis.trading.service;

import com.stock.analysis.market.LivePriceCache;
import com.stock.analysis.market.LivePriceCacheRepository;
import com.stock.analysis.portfolio.Holding;
import com.stock.analysis.portfolio.Portfolio;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.HoldingResponse;
import com.stock.analysis.trading.dto.PortfolioSummaryResponse;
import com.stock.analysis.trading.repository.HoldingRepository;
import com.stock.analysis.trading.repository.PortfolioRepository;
import com.stock.analysis.trading.repository.WalletBalanceRepository;
import com.stock.analysis.trading.repository.WalletRepository;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.Wallet;
import com.stock.analysis.wallet.WalletBalance;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final HoldingRepository holdingRepository;
    private final WalletRepository walletRepository;
    private final WalletBalanceRepository walletBalanceRepository;
    private final LivePriceCacheRepository livePriceCacheRepository;

    private static final BigDecimal INITIAL_DEMO_CAPITAL = new BigDecimal("100000.0000");

    @Override
    @Transactional
    public Portfolio getOrCreatePortfolio(User user, TradingMode mode) {
        return portfolioRepository.findByUserIdAndTradingMode(user.getId(), mode)
                .orElseGet(() -> {
                    Portfolio newPortfolio = Portfolio.builder()
                            .user(user)
                            .name(mode.name() + " Portfolio")
                            .description(mode.name() + " Trading Portfolio for " + user.getUsername())
                            .tradingMode(mode)
                            .totalRealizedPnl(BigDecimal.ZERO)
                            .totalInvested(BigDecimal.ZERO)
                            .createdBy(user.getUsername())
                            .build();

                    // Ensure wallet and wallet balance exist
                    Wallet wallet = walletRepository.findByUserId(user.getId())
                            .orElseGet(() -> walletRepository.save(Wallet.builder()
                                    .user(user)
                                    .currency("USD")
                                    .createdBy(user.getUsername())
                                    .build()));

                    walletBalanceRepository.findByWalletId(wallet.getId())
                            .orElseGet(() -> walletBalanceRepository.save(WalletBalance.builder()
                                    .wallet(wallet)
                                    .availableBalance(BigDecimal.ZERO)
                                    .lockedBalance(BigDecimal.ZERO)
                                    .demoAvailableBalance(INITIAL_DEMO_CAPITAL)
                                    .demoLockedBalance(BigDecimal.ZERO)
                                    .createdBy(user.getUsername())
                                    .build()));

                    return portfolioRepository.save(newPortfolio);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public PortfolioSummaryResponse getPortfolioSummary(User user, TradingMode mode) {
        Portfolio portfolio = getOrCreatePortfolio(user, mode);
        List<Holding> holdings = holdingRepository.findByPortfolioId(portfolio.getId());

        WalletBalance walletBalance = walletBalanceRepository.findByWalletUserId(user.getId())
                .orElseGet(() -> WalletBalance.builder()
                        .availableBalance(BigDecimal.ZERO)
                        .lockedBalance(BigDecimal.ZERO)
                        .demoAvailableBalance(INITIAL_DEMO_CAPITAL)
                        .demoLockedBalance(BigDecimal.ZERO)
                        .build());

        BigDecimal cashBalance = (mode == TradingMode.DEMO) ? walletBalance.getDemoAvailableBalance() : walletBalance.getAvailableBalance();
        BigDecimal lockedBalance = (mode == TradingMode.DEMO) ? walletBalance.getDemoLockedBalance() : walletBalance.getLockedBalance();

        BigDecimal holdingsMarketValue = BigDecimal.ZERO;
        BigDecimal totalCostBasis = BigDecimal.ZERO;
        List<HoldingResponse> holdingResponses = new ArrayList<>();

        for (Holding h : holdings) {
            if (h.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            Optional<LivePriceCache> livePriceCacheOpt = livePriceCacheRepository.findByStockId(h.getStock().getId());
            BigDecimal currentPrice = livePriceCacheOpt.map(LivePriceCache::getPrice).orElse(h.getAverageBuyPrice());

            BigDecimal marketValue = h.getQuantity().multiply(currentPrice).setScale(4, RoundingMode.HALF_UP);
            BigDecimal costBasis = h.getQuantity().multiply(h.getAverageBuyPrice()).setScale(4, RoundingMode.HALF_UP);
            BigDecimal unrealizedPnL = marketValue.subtract(costBasis).setScale(4, RoundingMode.HALF_UP);

            BigDecimal returnPct = BigDecimal.ZERO;
            if (costBasis.compareTo(BigDecimal.ZERO) > 0) {
                returnPct = unrealizedPnL.divide(costBasis, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
            }

            holdingsMarketValue = holdingsMarketValue.add(marketValue);
            totalCostBasis = totalCostBasis.add(costBasis);

            holdingResponses.add(HoldingResponse.builder()
                    .holdingId(h.getId())
                    .stockId(h.getStock().getId())
                    .stockSymbol(h.getStock().getSymbol())
                    .stockName(h.getStock().getName())
                    .quantity(h.getQuantity())
                    .averageBuyPrice(h.getAverageBuyPrice())
                    .currentPrice(currentPrice)
                    .marketValue(marketValue)
                    .totalCostBasis(costBasis)
                    .unrealizedPnL(unrealizedPnL)
                    .unrealizedPnLPercentage(returnPct)
                    .realizedPnL(h.getRealizedPnl())
                    .build());
        }

        BigDecimal totalPortfolioValue = cashBalance.add(lockedBalance).add(holdingsMarketValue);
        BigDecimal totalUnrealizedPnL = holdingsMarketValue.subtract(totalCostBasis);

        BigDecimal unrealizedPct = BigDecimal.ZERO;
        if (totalCostBasis.compareTo(BigDecimal.ZERO) > 0) {
            unrealizedPct = totalUnrealizedPnL.divide(totalCostBasis, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
        }

        BigDecimal initialCapital = (mode == TradingMode.DEMO) ? INITIAL_DEMO_CAPITAL : new BigDecimal("10000.00");
        BigDecimal totalReturnPct = totalPortfolioValue.subtract(initialCapital)
                .divide(initialCapital, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        return PortfolioSummaryResponse.builder()
                .portfolioId(portfolio.getId())
                .portfolioName(portfolio.getName())
                .tradingMode(mode)
                .cashBalance(cashBalance)
                .lockedBalance(lockedBalance)
                .totalCostBasis(totalCostBasis)
                .holdingsMarketValue(holdingsMarketValue)
                .totalPortfolioValue(totalPortfolioValue)
                .unrealizedPnL(totalUnrealizedPnL)
                .unrealizedPnLPercentage(unrealizedPct)
                .totalRealizedPnL(portfolio.getTotalRealizedPnl())
                .totalReturnPct(totalReturnPct)
                .dailyReturnPct(BigDecimal.ZERO) // Daily return metric placeholder
                .holdings(holdingResponses)
                .build();
    }
}
