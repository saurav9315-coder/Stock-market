package com.stock.analysis.trading.service;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.OrderStatus;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.OrderBookResponse;
import com.stock.analysis.trading.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderBookServiceImpl implements OrderBookService {

    private final OrderRepository orderRepository;

    @Override
    public void addOrder(Order order) {
        log.info("Order added to active order book: symbol={}, orderId={}, side={}",
                order.getStock().getSymbol(), order.getId(), order.getSide());
    }

    @Override
    public void removeOrder(Order order) {
        log.info("Order removed from active order book: symbol={}, orderId={}",
                order.getStock().getSymbol(), order.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderBookResponse getMarketDepth(String symbol) {
        List<Order> activeOrders = orderRepository.findByStockSymbolAndStatusAndMode(
                symbol, OrderStatus.PENDING, TradingMode.DEMO);

        // Separate Bids (Buy orders) and Asks (Sell orders)
        List<Order> buyOrders = activeOrders.stream()
                .filter(o -> o.getSide() == OrderSide.BUY && o.getLimitPrice() != null)
                .collect(Collectors.toList());

        List<Order> sellOrders = activeOrders.stream()
                .filter(o -> o.getSide() == OrderSide.SELL && o.getLimitPrice() != null)
                .collect(Collectors.toList());

        // Group Bids by price, sorted descending (highest bid first)
        Map<BigDecimal, List<Order>> bidsByPrice = buyOrders.stream()
                .collect(Collectors.groupingBy(Order::getLimitPrice));

        List<OrderBookResponse.OrderBookLevelDto> bidLevels = bidsByPrice.entrySet().stream()
                .map(e -> OrderBookResponse.OrderBookLevelDto.builder()
                        .price(e.getKey())
                        .quantity(e.getValue().stream().map(o -> o.getQuantity().subtract(o.getFilledQuantity())).reduce(BigDecimal.ZERO, BigDecimal::add))
                        .orderCount(e.getValue().size())
                        .build())
                .sorted(Comparator.comparing(OrderBookResponse.OrderBookLevelDto::getPrice).reversed())
                .limit(10)
                .collect(Collectors.toList());

        // Group Asks by price, sorted ascending (lowest ask first)
        Map<BigDecimal, List<Order>> asksByPrice = sellOrders.stream()
                .collect(Collectors.groupingBy(Order::getLimitPrice));

        List<OrderBookResponse.OrderBookLevelDto> askLevels = asksByPrice.entrySet().stream()
                .map(e -> OrderBookResponse.OrderBookLevelDto.builder()
                        .price(e.getKey())
                        .quantity(e.getValue().stream().map(o -> o.getQuantity().subtract(o.getFilledQuantity())).reduce(BigDecimal.ZERO, BigDecimal::add))
                        .orderCount(e.getValue().size())
                        .build())
                .sorted(Comparator.comparing(OrderBookResponse.OrderBookLevelDto::getPrice))
                .limit(10)
                .collect(Collectors.toList());

        return OrderBookResponse.builder()
                .symbol(symbol)
                .bids(bidLevels)
                .asks(askLevels)
                .lastUpdated(Instant.now())
                .build();
    }
}
