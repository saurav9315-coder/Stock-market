package com.stock.analysis.trading.mapper;

import com.stock.analysis.trading.dto.TradeExecutionResponse;
import com.stock.analysis.trading.entity.TradeExecution;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TradeMapper {

    @Mapping(target = "buyOrderId", source = "buyOrder.id")
    @Mapping(target = "sellOrderId", source = "sellOrder.id")
    @Mapping(target = "stockId", source = "stock.id")
    @Mapping(target = "stockSymbol", source = "stock.symbol")
    @Mapping(target = "stockName", source = "stock.name")
    TradeExecutionResponse toDto(TradeExecution execution);
}
