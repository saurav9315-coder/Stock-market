package com.stock.analysis.trading.mapper;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.dto.OrderResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "portfolioId", source = "portfolio.id")
    @Mapping(target = "stockId", source = "stock.id")
    @Mapping(target = "stockSymbol", source = "stock.symbol")
    @Mapping(target = "stockName", source = "stock.name")
    OrderResponse toDto(Order order);
}
