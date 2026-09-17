package com.stock.analysis.market.mapper;

import com.stock.analysis.mapper.BaseMapper;
import com.stock.analysis.market.LivePriceCache;
import com.stock.analysis.market.dto.LivePriceDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LivePriceMapper extends BaseMapper<LivePriceDto, LivePriceCache> {

    @Override
    @Mapping(target = "symbol", source = "stock.symbol")
    @Mapping(target = "bid", source = "bidPrice")
    @Mapping(target = "ask", source = "askPrice")
    LivePriceDto toDto(LivePriceCache entity);

    @Override
    @Mapping(target = "stock", ignore = true)
    @Mapping(target = "bidPrice", source = "bid")
    @Mapping(target = "askPrice", source = "ask")
    LivePriceCache toEntity(LivePriceDto dto);
}
