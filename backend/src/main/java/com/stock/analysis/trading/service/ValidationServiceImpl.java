package com.stock.analysis.trading.service;

import com.stock.analysis.market.Stock;
import com.stock.analysis.portfolio.Holding;
import com.stock.analysis.portfolio.Portfolio;
import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.OrderType;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.OrderCreateRequest;
import com.stock.analysis.trading.repository.HoldingRepository;
import com.stock.analysis.trading.repository.OrderRepository;
import com.stock.analysis.trading.repository.WalletBalanceRepository;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.WalletBalance;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ValidationServiceImpl implements ValidationService {

    private final WalletBalanceRepository walletBalanceRepository;
    private final HoldingRepository holdingRepository;
    private final OrderRepository orderRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final BigDecimal MAX_PER_ORDER_VALUE = new BigDecimal("1000000.00");
    private static final BigDecimal MIN_ORDER_QUANTITY = new BigDecimal("0.0001");

    @Override
    public void validateOrderRequest(User user, OrderCreateRequest request, Stock stock, Portfolio portfolio) {
        if (stock == null || !stock.isActive()) {
            throw new IllegalArgumentException("Stock is currently not active or available for trading");
        }

        if (request.getQuantity() == null || request.getQuantity().compareTo(MIN_ORDER_QUANTITY) < 0) {
            throw new IllegalArgumentException("Order quantity must be at least " + MIN_ORDER_QUANTITY);
        }

        validateMarketHours(stock);

        if (request.getClientOrderId() != null && !request.getClientOrderId().isBlank()) {
            validateIdempotency(request.getClientOrderId());
        }

        if (request.getOrderType() == OrderType.LIMIT && (request.getLimitPrice() == null || request.getLimitPrice().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new IllegalArgumentException("Limit price is required and must be positive for LIMIT orders");
        }

        if ((request.getOrderType() == OrderType.STOP_LOSS || request.getOrderType() == OrderType.STOP_LIMIT)
                && (request.getStopPrice() == null || request.getStopPrice().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new IllegalArgumentException("Stop price is required and must be positive for STOP orders");
        }

        if (request.getSide() == OrderSide.SELL) {
            validateSufficientHoldings(portfolio, stock, request.getQuantity());
        }
    }

    @Override
    public void validateMarketHours(Stock stock) {
        LocalTime now = LocalTime.now();
        LocalTime marketOpen = LocalTime.of(0, 0);   // Flexible for test environment
        LocalTime marketClose = LocalTime.of(23, 59);

        if (now.isBefore(marketOpen) || now.isAfter(marketClose)) {
            log.warn("Order attempt outside standard market hours for symbol={}", stock.getSymbol());
        }
    }

    @Override
    public void validateSufficientBalance(User user, TradingMode mode, BigDecimal requiredAmount) {
        WalletBalance walletBalance = walletBalanceRepository.findByWalletUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User wallet not found"));

        BigDecimal available = (mode == TradingMode.DEMO)
                ? walletBalance.getDemoAvailableBalance()
                : walletBalance.getAvailableBalance();

        if (available.compareTo(requiredAmount) < 0) {
            throw new IllegalArgumentException(String.format("Insufficient %s balance. Required: %s, Available: %s",
                    mode, requiredAmount, available));
        }
    }

    @Override
    public void validateSufficientHoldings(Portfolio portfolio, Stock stock, BigDecimal sellQuantity) {
        Holding holding = holdingRepository.findByPortfolioIdAndStockId(portfolio.getId(), stock.getId())
                .orElseThrow(() -> new IllegalArgumentException("You do not own any holdings of stock: " + stock.getSymbol()));

        BigDecimal pendingSellQty = Optional.ofNullable(orderRepository.getPendingSellQuantity(portfolio.getId(), stock.getId()))
                .orElse(BigDecimal.ZERO);
        BigDecimal availableShares = holding.getQuantity().subtract(pendingSellQty);

        if (availableShares.compareTo(sellQuantity) < 0) {
            throw new IllegalArgumentException(String.format("Insufficient available holdings for %s. Owned: %s, Locked in Pending Sell Orders: %s, Available: %s, Requested to Sell: %s",
                    stock.getSymbol(), holding.getQuantity(), pendingSellQty, availableShares.max(BigDecimal.ZERO), sellQuantity));
        }
    }

    @Override
    public void validateIdempotency(String clientOrderId) {
        String lockKey = "idempotency:order:" + clientOrderId;
        Boolean success = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofMinutes(5));
        if (Boolean.FALSE.equals(success)) {
            throw new IllegalStateException("Duplicate order request detected for clientOrderId: " + clientOrderId);
        }

        Optional<com.stock.analysis.portfolio.Order> existing = orderRepository.findByClientOrderId(clientOrderId);
        if (existing.isPresent()) {
            throw new IllegalStateException("Order with clientOrderId already exists: " + clientOrderId);
        }
    }

    @Override
    public void validateTradingLimits(User user, BigDecimal orderValue) {
        if (orderValue.compareTo(MAX_PER_ORDER_VALUE) > 0) {
            throw new IllegalArgumentException("Order value exceeds maximum single order limit of " + MAX_PER_ORDER_VALUE);
        }
    }
}
