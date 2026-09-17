package com.stock.analysis.trading.service;

import com.stock.analysis.market.LivePriceCache;
import com.stock.analysis.market.LivePriceCacheRepository;
import com.stock.analysis.market.Stock;
import com.stock.analysis.market.StockRepository;
import com.stock.analysis.portfolio.Order;
import com.stock.analysis.portfolio.Portfolio;
import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.OrderStatus;
import com.stock.analysis.trading.domain.OrderType;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.FeeBreakdown;
import com.stock.analysis.trading.dto.OrderCreateRequest;
import com.stock.analysis.trading.dto.OrderResponse;
import com.stock.analysis.trading.entity.OrderAuditLog;
import com.stock.analysis.trading.event.TradingEventPublisher;
import com.stock.analysis.trading.mapper.OrderMapper;
import com.stock.analysis.trading.repository.OrderAuditLogRepository;
import com.stock.analysis.trading.repository.OrderRepository;
import com.stock.analysis.trading.repository.WalletBalanceRepository;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.WalletBalance;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TradingServiceImpl implements TradingService {

    private final StockRepository stockRepository;
    private final LivePriceCacheRepository livePriceCacheRepository;
    private final PortfolioService portfolioService;
    private final ValidationService validationService;
    private final FeeCalculationService feeCalculationService;
    private final OrderRepository orderRepository;
    private final OrderAuditLogRepository orderAuditLogRepository;
    private final WalletBalanceRepository walletBalanceRepository;
    private final OrderBookService orderBookService;
    private final ExecutionService executionService;
    private final OrderMapper orderMapper;
    private final TradingEventPublisher eventPublisher;

    @Override
    @Transactional
    public OrderResponse placeOrder(User user, OrderCreateRequest request) {
        log.info("Placing order for user={}, symbol={}, side={}, type={}, mode={}, qty={}",
                user.getUsername(), request.getSymbol(), request.getSide(), request.getOrderType(),
                request.getTradingMode(), request.getQuantity());

        Stock stock = stockRepository.findBySymbol(request.getSymbol().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Stock symbol not found: " + request.getSymbol()));

        TradingMode mode = request.getTradingMode() != null ? request.getTradingMode() : TradingMode.DEMO;
        Portfolio portfolio = portfolioService.getOrCreatePortfolio(user, mode);

        validationService.validateOrderRequest(user, request, stock, portfolio);

        Optional<LivePriceCache> priceCacheOpt = livePriceCacheRepository.findByStockId(stock.getId());
        BigDecimal currentMarketPrice = priceCacheOpt.map(LivePriceCache::getPrice)
                .orElseThrow(() -> new IllegalArgumentException("Live price unavailable for symbol: " + stock.getSymbol()));

        BigDecimal estimatedPrice = request.getOrderType() == OrderType.MARKET
                ? currentMarketPrice
                : (request.getLimitPrice() != null ? request.getLimitPrice() : currentMarketPrice);

        FeeBreakdown estimatedFees = feeCalculationService.calculateFees(
                request.getSide(), mode, request.getQuantity(), estimatedPrice, user);

        BigDecimal estimatedTotalCost = request.getQuantity().multiply(estimatedPrice)
                .add(estimatedFees.getTotalFee()).setScale(4, RoundingMode.HALF_UP);

        validationService.validateTradingLimits(user, estimatedTotalCost);

        // Lock Funds if Buy Order
        if (request.getSide() == OrderSide.BUY) {
            validationService.validateSufficientBalance(user, mode, estimatedTotalCost);
            WalletBalance walletBalance = walletBalanceRepository.findByWalletUserIdWithLock(user.getId())
                    .orElseThrow(() -> new IllegalStateException("User wallet balance not found"));

            if (mode == TradingMode.DEMO) {
                walletBalance.setDemoAvailableBalance(walletBalance.getDemoAvailableBalance().subtract(estimatedTotalCost));
                walletBalance.setDemoLockedBalance(walletBalance.getDemoLockedBalance().add(estimatedTotalCost));
            } else {
                walletBalance.setAvailableBalance(walletBalance.getAvailableBalance().subtract(estimatedTotalCost));
                walletBalance.setLockedBalance(walletBalance.getLockedBalance().add(estimatedTotalCost));
            }
            walletBalanceRepository.save(walletBalance);
            eventPublisher.publishWalletUpdated(walletBalance.getWallet(), mode,
                    mode == TradingMode.DEMO ? walletBalance.getDemoAvailableBalance() : walletBalance.getAvailableBalance());
        }

        // Build & Save Order
        Order order = Order.builder()
                .user(user)
                .portfolio(portfolio)
                .stock(stock)
                .tradingMode(mode)
                .side(request.getSide())
                .orderType(request.getOrderType())
                .status(OrderStatus.PENDING)
                .quantity(request.getQuantity())
                .filledQuantity(BigDecimal.ZERO)
                .limitPrice(request.getLimitPrice())
                .stopPrice(request.getStopPrice())
                .triggerPrice(request.getTriggerPrice())
                .totalFee(estimatedFees.getTotalFee())
                .totalAmount(estimatedTotalCost)
                .clientOrderId(request.getClientOrderId())
                .expiresAt(request.getExpiresAt())
                .createdBy(user.getUsername())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Audit Log Entry
        OrderAuditLog auditLog = OrderAuditLog.builder()
                .order(savedOrder)
                .previousStatus(null)
                .newStatus(OrderStatus.PENDING)
                .reason("Order submitted successfully")
                .actionBy(user.getUsername())
                .createdBy(user.getUsername())
                .build();
        orderAuditLogRepository.save(auditLog);

        eventPublisher.publishOrderCreated(savedOrder);
        orderBookService.addOrder(savedOrder);

        // Execution Logic: Immediate execution for MARKET order
        if (request.getOrderType() == OrderType.MARKET) {
            executionService.executeOrder(savedOrder, currentMarketPrice);
        } else {
            // Check if limit/stop order is immediately fillable
            executionService.executeOrder(savedOrder, currentMarketPrice);
        }

        // Re-fetch latest state after execution attempt
        Order finalOrder = orderRepository.findById(savedOrder.getId()).orElse(savedOrder);
        return orderMapper.toDto(finalOrder);
    }
}
