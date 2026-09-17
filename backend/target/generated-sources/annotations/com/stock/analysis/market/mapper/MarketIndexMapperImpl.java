package com.stock.analysis.market.mapper;

import com.stock.analysis.market.MarketIndex;
import com.stock.analysis.market.dto.MarketIndexDto;
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
public class MarketIndexMapperImpl implements MarketIndexMapper {

    @Override
    public List<MarketIndex> toEntityList(List<MarketIndexDto> dtoList) {
        if ( dtoList == null ) {
            return null;
        }

        List<MarketIndex> list = new ArrayList<MarketIndex>( dtoList.size() );
        for ( MarketIndexDto marketIndexDto : dtoList ) {
            list.add( toEntity( marketIndexDto ) );
        }

        return list;
    }

    @Override
    public List<MarketIndexDto> toDtoList(List<MarketIndex> entityList) {
        if ( entityList == null ) {
            return null;
        }

        List<MarketIndexDto> list = new ArrayList<MarketIndexDto>( entityList.size() );
        for ( MarketIndex marketIndex : entityList ) {
            list.add( toDto( marketIndex ) );
        }

        return list;
    }

    @Override
    public void updateEntityFromDto(MarketIndexDto dto, MarketIndex entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getChangeAmount() != null ) {
            entity.setChangeAmount( dto.getChangeAmount() );
        }
        if ( dto.getChangePercent() != null ) {
            entity.setChangePercent( dto.getChangePercent() );
        }
        if ( dto.getName() != null ) {
            entity.setName( dto.getName() );
        }
        if ( dto.getSymbol() != null ) {
            entity.setSymbol( dto.getSymbol() );
        }
        if ( dto.getValue() != null ) {
            entity.setValue( dto.getValue() );
        }
    }

    @Override
    public MarketIndexDto toDto(MarketIndex entity) {
        if ( entity == null ) {
            return null;
        }

        MarketIndexDto.MarketIndexDtoBuilder marketIndexDto = MarketIndexDto.builder();

        marketIndexDto.lastUpdatedAt( entity.getUpdatedAt() );
        marketIndexDto.changeAmount( entity.getChangeAmount() );
        marketIndexDto.changePercent( entity.getChangePercent() );
        marketIndexDto.name( entity.getName() );
        marketIndexDto.symbol( entity.getSymbol() );
        marketIndexDto.value( entity.getValue() );

        return marketIndexDto.build();
    }

    @Override
    public MarketIndex toEntity(MarketIndexDto dto) {
        if ( dto == null ) {
            return null;
        }

        MarketIndex.MarketIndexBuilder<?, ?> marketIndex = MarketIndex.builder();

        marketIndex.changeAmount( dto.getChangeAmount() );
        marketIndex.changePercent( dto.getChangePercent() );
        marketIndex.name( dto.getName() );
        marketIndex.symbol( dto.getSymbol() );
        marketIndex.value( dto.getValue() );

        return marketIndex.build();
    }
}
