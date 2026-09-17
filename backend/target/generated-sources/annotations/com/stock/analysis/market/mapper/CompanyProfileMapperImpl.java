package com.stock.analysis.market.mapper;

import com.stock.analysis.market.CompanyProfile;
import com.stock.analysis.market.Stock;
import com.stock.analysis.market.dto.CompanyProfileDto;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-01T18:49:57+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class CompanyProfileMapperImpl implements CompanyProfileMapper {

    @Override
    public List<CompanyProfile> toEntityList(List<CompanyProfileDto> dtoList) {
        if ( dtoList == null ) {
            return null;
        }

        List<CompanyProfile> list = new ArrayList<CompanyProfile>( dtoList.size() );
        for ( CompanyProfileDto companyProfileDto : dtoList ) {
            list.add( toEntity( companyProfileDto ) );
        }

        return list;
    }

    @Override
    public List<CompanyProfileDto> toDtoList(List<CompanyProfile> entityList) {
        if ( entityList == null ) {
            return null;
        }

        List<CompanyProfileDto> list = new ArrayList<CompanyProfileDto>( entityList.size() );
        for ( CompanyProfile companyProfile : entityList ) {
            list.add( toDto( companyProfile ) );
        }

        return list;
    }

    @Override
    public void updateEntityFromDto(CompanyProfileDto dto, CompanyProfile entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getCeo() != null ) {
            entity.setCeo( dto.getCeo() );
        }
        if ( dto.getDescription() != null ) {
            entity.setDescription( dto.getDescription() );
        }
        if ( dto.getDividendYield() != null ) {
            entity.setDividendYield( dto.getDividendYield() );
        }
        if ( dto.getIndustry() != null ) {
            entity.setIndustry( dto.getIndustry() );
        }
        if ( dto.getMarketCap() != null ) {
            entity.setMarketCap( dto.getMarketCap() );
        }
        if ( dto.getPeRatio() != null ) {
            entity.setPeRatio( dto.getPeRatio() );
        }
        if ( dto.getSector() != null ) {
            entity.setSector( dto.getSector() );
        }
        if ( dto.getWebsite() != null ) {
            entity.setWebsite( dto.getWebsite() );
        }
    }

    @Override
    public CompanyProfileDto toDto(CompanyProfile entity) {
        if ( entity == null ) {
            return null;
        }

        CompanyProfileDto.CompanyProfileDtoBuilder companyProfileDto = CompanyProfileDto.builder();

        companyProfileDto.symbol( entityStockSymbol( entity ) );
        companyProfileDto.ceo( entity.getCeo() );
        companyProfileDto.description( entity.getDescription() );
        companyProfileDto.dividendYield( entity.getDividendYield() );
        companyProfileDto.industry( entity.getIndustry() );
        companyProfileDto.marketCap( entity.getMarketCap() );
        companyProfileDto.peRatio( entity.getPeRatio() );
        companyProfileDto.sector( entity.getSector() );
        companyProfileDto.website( entity.getWebsite() );

        return companyProfileDto.build();
    }

    @Override
    public CompanyProfile toEntity(CompanyProfileDto dto) {
        if ( dto == null ) {
            return null;
        }

        CompanyProfile.CompanyProfileBuilder<?, ?> companyProfile = CompanyProfile.builder();

        companyProfile.ceo( dto.getCeo() );
        companyProfile.description( dto.getDescription() );
        companyProfile.dividendYield( dto.getDividendYield() );
        companyProfile.industry( dto.getIndustry() );
        companyProfile.marketCap( dto.getMarketCap() );
        companyProfile.peRatio( dto.getPeRatio() );
        companyProfile.sector( dto.getSector() );
        companyProfile.website( dto.getWebsite() );

        return companyProfile.build();
    }

    private String entityStockSymbol(CompanyProfile companyProfile) {
        if ( companyProfile == null ) {
            return null;
        }
        Stock stock = companyProfile.getStock();
        if ( stock == null ) {
            return null;
        }
        String symbol = stock.getSymbol();
        if ( symbol == null ) {
            return null;
        }
        return symbol;
    }
}
