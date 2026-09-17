package com.stock.analysis.trading.strategy;

import com.stock.analysis.trading.domain.OrderType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class OrderStrategyFactory {

    private final Map<OrderType, OrderExecutionStrategy> strategyMap;

    public OrderStrategyFactory(List<OrderExecutionStrategy> strategies) {
        this.strategyMap = strategies.stream()
                .collect(Collectors.toMap(OrderExecutionStrategy::getOrderType, Function.identity()));
    }

    public OrderExecutionStrategy getStrategy(OrderType orderType) {
        return Optional.ofNullable(strategyMap.get(orderType))
                .orElseThrow(() -> new IllegalArgumentException("Unsupported order type strategy: " + orderType));
    }
}
