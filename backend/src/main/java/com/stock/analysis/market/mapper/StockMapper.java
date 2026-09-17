package com.stock.analysis.market.mapper;

import com.stock.analysis.mapper.BaseMapper;
import com.stock.analysis.market.Stock;
import com.stock.analysis.market.dto.StockDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StockMapper extends BaseMapper<StockDto, Stock> {

    @Override
    @Mapping(target = "exchangeCode", source = "exchange.code")
    StockDto toDto(Stock entity);

    @Override
    @Mapping(target = "exchange", ignore = true)
    Stock toEntity(StockDto dto);
}
