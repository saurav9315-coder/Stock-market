package com.stock.analysis.trading.repository;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.domain.OrderStatus;
import com.stock.analysis.trading.domain.TradingMode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Optional<Order> findByIdAndUserId(UUID id, UUID userId);

    Optional<Order> findByClientOrderId(String clientOrderId);

    Page<Order> findByUserIdAndTradingMode(UUID userId, TradingMode tradingMode, Pageable pageable);

    Page<Order> findByUserIdAndTradingModeAndStatus(UUID userId, TradingMode tradingMode, OrderStatus status, Pageable pageable);

    List<Order> findByStockIdAndStatusIn(UUID stockId, List<OrderStatus> statuses);

    @Query("SELECT o FROM Order o WHERE o.status IN :statuses AND o.tradingMode = :tradingMode ORDER BY o.createdAt ASC")
    List<Order> findActiveOrdersByMode(@Param("statuses") List<OrderStatus> statuses, @Param("tradingMode") TradingMode tradingMode);

    @Query("SELECT o FROM Order o WHERE o.stock.symbol = :symbol AND o.status = :status AND o.tradingMode = :tradingMode")
    List<Order> findByStockSymbolAndStatusAndMode(
            @Param("symbol") String symbol,
            @Param("status") OrderStatus status,
            @Param("tradingMode") TradingMode tradingMode);

    @Query("SELECT COALESCE(SUM(o.quantity - o.filledQuantity), 0) FROM Order o WHERE o.portfolio.id = :portfolioId AND o.stock.id = :stockId AND o.side = 'SELL' AND o.status IN ('PENDING', 'PARTIALLY_FILLED')")
    BigDecimal getPendingSellQuantity(@Param("portfolioId") UUID portfolioId, @Param("stockId") UUID stockId);

    long countByStatus(String status);

    Page<Order> findByStatus(String status, Pageable pageable);
}
