package com.stock.analysis.market.mapper;

import com.stock.analysis.mapper.BaseMapper;
import com.stock.analysis.market.CompanyProfile;
import com.stock.analysis.market.dto.CompanyProfileDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CompanyProfileMapper extends BaseMapper<CompanyProfileDto, CompanyProfile> {

    @Override
    @Mapping(target = "symbol", source = "stock.symbol")
    CompanyProfileDto toDto(CompanyProfile entity);

    @Override
    @Mapping(target = "stock", ignore = true)
    CompanyProfile toEntity(CompanyProfileDto dto);
}
