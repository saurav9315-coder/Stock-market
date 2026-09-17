package com.stock.analysis.market.mapper;

import com.stock.analysis.mapper.BaseMapper;
import com.stock.analysis.market.HistoricalPrice;
import com.stock.analysis.market.dto.HistoricalPriceDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface HistoricalPriceMapper extends BaseMapper<HistoricalPriceDto, HistoricalPrice> {

    @Override
    @Mapping(target = "symbol", source = "stock.symbol")
    @Mapping(target = "open", source = "openPrice")
    @Mapping(target = "high", source = "highPrice")
    @Mapping(target = "low", source = "lowPrice")
    @Mapping(target = "close", source = "closePrice")
    HistoricalPriceDto toDto(HistoricalPrice entity);

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "stock", ignore = true)
    @Mapping(target = "openPrice", source = "open")
    @Mapping(target = "highPrice", source = "high")
    @Mapping(target = "lowPrice", source = "low")
    @Mapping(target = "closePrice", source = "close")
    HistoricalPrice toEntity(HistoricalPriceDto dto);
}
