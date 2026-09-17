package com.stock.analysis.portfolio;

import com.stock.analysis.common.BaseEntity;
import com.stock.analysis.market.Stock;
import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.OrderStatus;
import com.stock.analysis.trading.domain.OrderType;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.users.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "orders")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class Order extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Enumerated(EnumType.STRING)
    @Column(name = "trading_mode", nullable = false, length = 10)
    @Builder.Default
    private TradingMode tradingMode = TradingMode.LIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 10)
    private OrderSide side; // BUY, SELL

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false, length = 20)
    private OrderType orderType; // MARKET, LIMIT, STOP_LOSS, STOP_LIMIT, TAKE_PROFIT

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OrderStatus status; // PENDING, PARTIALLY_FILLED, FILLED, CANCELLED, REJECTED, EXPIRED

    @Column(name = "quantity", nullable = false, precision = 18, scale = 6)
    private BigDecimal quantity;

    @Column(name = "filled_quantity", nullable = false, precision = 18, scale = 6)
    @Builder.Default
    private BigDecimal filledQuantity = BigDecimal.ZERO;

    @Column(name = "limit_price", precision = 18, scale = 4)
    private BigDecimal limitPrice;

    @Column(name = "stop_price", precision = 18, scale = 4)
    private BigDecimal stopPrice;

    @Column(name = "trigger_price", precision = 18, scale = 4)
    private BigDecimal triggerPrice;

    @Column(name = "avg_fill_price", precision = 18, scale = 4)
    private BigDecimal avgFillPrice;

    @Column(name = "total_fee", nullable = false, precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal totalFee = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "client_order_id", length = 100)
    private String clientOrderId;

    @Column(name = "cancelled_reason")
    private String cancelledReason;

    @Column(name = "rejected_reason")
    private String rejectedReason;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "filled_at")
    private Instant filledAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;
}
