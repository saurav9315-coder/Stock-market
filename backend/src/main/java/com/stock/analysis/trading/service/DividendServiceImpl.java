package com.stock.analysis.trading.service;

import com.stock.analysis.market.Stock;
import com.stock.analysis.market.StockRepository;
import com.stock.analysis.portfolio.Holding;
import com.stock.analysis.trading.domain.DividendStatus;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.DividendPayoutResponse;
import com.stock.analysis.trading.dto.DividendRequest;
import com.stock.analysis.trading.dto.DividendResponse;
import com.stock.analysis.trading.entity.Dividend;
import com.stock.analysis.trading.entity.DividendPayout;
import com.stock.analysis.trading.repository.DividendPayoutRepository;
import com.stock.analysis.trading.repository.DividendRepository;
import com.stock.analysis.trading.repository.HoldingRepository;
import com.stock.analysis.trading.repository.TransactionHistoryRepository;
import com.stock.analysis.trading.repository.WalletBalanceRepository;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.TransactionHistory;
import com.stock.analysis.wallet.WalletBalance;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DividendServiceImpl implements DividendService {

    private final StockRepository stockRepository;
    private final DividendRepository dividendRepository;
    private final DividendPayoutRepository dividendPayoutRepository;
    private final HoldingRepository holdingRepository;
    private final WalletBalanceRepository walletBalanceRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;

    private static final BigDecimal WITHHOLDING_TAX_RATE = new BigDecimal("0.1000"); // 10% tax

    @Override
    @Transactional
    public DividendResponse announceDividend(DividendRequest request, String createdBy) {
        Stock stock = stockRepository.findBySymbol(request.getSymbol().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Stock symbol not found: " + request.getSymbol()));

        Dividend dividend = Dividend.builder()
                .stock(stock)
                .amountPerShare(request.getAmountPerShare())
                .exDate(request.getExDate())
                .recordDate(request.getRecordDate())
                .paymentDate(request.getPaymentDate())
                .status(DividendStatus.ANNOUNCED)
                .createdBy(createdBy)
                .build();

        Dividend saved = dividendRepository.save(dividend);

        return DividendResponse.builder()
                .id(saved.getId())
                .stockId(stock.getId())
                .stockSymbol(stock.getSymbol())
                .stockName(stock.getName())
                .amountPerShare(saved.getAmountPerShare())
                .exDate(saved.getExDate())
                .recordDate(saved.getRecordDate())
                .paymentDate(saved.getPaymentDate())
                .status(saved.getStatus())
                .build();
    }

    @Override
    @Transactional
    public List<DividendPayoutResponse> processDividendPayouts(UUID dividendId) {
        Dividend dividend = dividendRepository.findById(dividendId)
                .orElseThrow(() -> new IllegalArgumentException("Dividend record not found: " + dividendId));

        if (dividend.getStatus() == DividendStatus.COMPLETED) {
            throw new IllegalStateException("Dividend payouts already completed for id: " + dividendId);
        }

        dividend.setStatus(DividendStatus.PAYING);
        dividendRepository.save(dividend);

        List<Holding> holdings = holdingRepository.findByStockId(dividend.getStock().getId());
        List<DividendPayoutResponse> payoutResponses = new ArrayList<>();

        for (Holding h : holdings) {
            if (h.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            BigDecimal grossAmount = h.getQuantity().multiply(dividend.getAmountPerShare()).setScale(4, RoundingMode.HALF_UP);
            BigDecimal taxDeducted = grossAmount.multiply(WITHHOLDING_TAX_RATE).setScale(4, RoundingMode.HALF_UP);
            BigDecimal netAmount = grossAmount.subtract(taxDeducted).setScale(4, RoundingMode.HALF_UP);

            User user = h.getPortfolio().getUser();
            TradingMode mode = h.getPortfolio().getTradingMode();

            // Credit user wallet
            WalletBalance walletBalance = walletBalanceRepository.findByWalletUserId(user.getId()).orElse(null);
            if (walletBalance != null) {
                if (mode == TradingMode.DEMO) {
                    walletBalance.setDemoAvailableBalance(walletBalance.getDemoAvailableBalance().add(netAmount));
                } else {
                    walletBalance.setAvailableBalance(walletBalance.getAvailableBalance().add(netAmount));
                }
                walletBalanceRepository.save(walletBalance);

                // Immutable transaction history
                transactionHistoryRepository.save(TransactionHistory.builder()
                        .wallet(walletBalance.getWallet())
                        .type("DIVIDEND")
                        .amount(netAmount)
                        .fee(taxDeducted)
                        .status("COMPLETED")
                        .referenceType("DIVIDEND")
                        .referenceId(dividend.getId())
                        .createdBy("SYSTEM")
                        .build());
            }

            DividendPayout payout = DividendPayout.builder()
                    .dividend(dividend)
                    .user(user)
                    .portfolio(h.getPortfolio())
                    .tradingMode(mode)
                    .sharesHeld(h.getQuantity())
                    .grossAmount(grossAmount)
                    .taxDeducted(taxDeducted)
                    .netAmount(netAmount)
                    .paidAt(Instant.now())
                    .createdBy("SYSTEM")
                    .build();

            DividendPayout savedPayout = dividendPayoutRepository.save(payout);

            payoutResponses.add(DividendPayoutResponse.builder()
                    .id(savedPayout.getId())
                    .dividendId(dividend.getId())
                    .stockSymbol(dividend.getStock().getSymbol())
                    .stockName(dividend.getStock().getName())
                    .tradingMode(mode)
                    .sharesHeld(h.getQuantity())
                    .grossAmount(grossAmount)
                    .taxDeducted(taxDeducted)
                    .netAmount(netAmount)
                    .paidAt(savedPayout.getPaidAt())
                    .build());
        }

        dividend.setStatus(DividendStatus.COMPLETED);
        dividendRepository.save(dividend);

        return payoutResponses;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DividendPayoutResponse> getUserDividendPayouts(User user, Pageable pageable) {
        return dividendPayoutRepository.findByUserIdAndTradingMode(user.getId(), TradingMode.DEMO, pageable)
                .map(p -> DividendPayoutResponse.builder()
                        .id(p.getId())
                        .dividendId(p.getDividend().getId())
                        .stockSymbol(p.getDividend().getStock().getSymbol())
                        .stockName(p.getDividend().getStock().getName())
                        .tradingMode(p.getTradingMode())
                        .sharesHeld(p.getSharesHeld())
                        .grossAmount(p.getGrossAmount())
                        .taxDeducted(p.getTaxDeducted())
                        .netAmount(p.getNetAmount())
                        .paidAt(p.getPaidAt())
                        .build());
    }
}
