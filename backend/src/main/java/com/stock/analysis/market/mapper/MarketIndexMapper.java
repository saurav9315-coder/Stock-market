package com.stock.analysis.market.mapper;

import com.stock.analysis.mapper.BaseMapper;
import com.stock.analysis.market.MarketIndex;
import com.stock.analysis.market.dto.MarketIndexDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MarketIndexMapper extends BaseMapper<MarketIndexDto, MarketIndex> {

    @Override
    @Mapping(target = "lastUpdatedAt", source = "updatedAt")
    MarketIndexDto toDto(MarketIndex entity);

    @Override
    MarketIndex toEntity(MarketIndexDto dto);
}
