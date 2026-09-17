package com.stock.analysis.market.mapper;

import com.stock.analysis.market.HistoricalPrice;
import com.stock.analysis.market.Stock;
import com.stock.analysis.market.dto.HistoricalPriceDto;
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
public class HistoricalPriceMapperImpl implements HistoricalPriceMapper {

    @Override
    public List<HistoricalPrice> toEntityList(List<HistoricalPriceDto> dtoList) {
        if ( dtoList == null ) {
            return null;
        }

        List<HistoricalPrice> list = new ArrayList<HistoricalPrice>( dtoList.size() );
        for ( HistoricalPriceDto historicalPriceDto : dtoList ) {
            list.add( toEntity( historicalPriceDto ) );
        }

        return list;
    }

    @Override
    public List<HistoricalPriceDto> toDtoList(List<HistoricalPrice> entityList) {
        if ( entityList == null ) {
            return null;
        }

        List<HistoricalPriceDto> list = new ArrayList<HistoricalPriceDto>( entityList.size() );
        for ( HistoricalPrice historicalPrice : entityList ) {
            list.add( toDto( historicalPrice ) );
        }

        return list;
    }

    @Override
    public void updateEntityFromDto(HistoricalPriceDto dto, HistoricalPrice entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getTimestamp() != null ) {
            entity.setTimestamp( dto.getTimestamp() );
        }
        if ( dto.getVolume() != null ) {
            entity.setVolume( dto.getVolume() );
        }
    }

    @Override
    public HistoricalPriceDto toDto(HistoricalPrice entity) {
        if ( entity == null ) {
            return null;
        }

        HistoricalPriceDto.HistoricalPriceDtoBuilder historicalPriceDto = HistoricalPriceDto.builder();

        historicalPriceDto.symbol( entityStockSymbol( entity ) );
        historicalPriceDto.open( entity.getOpenPrice() );
        historicalPriceDto.high( entity.getHighPrice() );
        historicalPriceDto.low( entity.getLowPrice() );
        historicalPriceDto.close( entity.getClosePrice() );
        historicalPriceDto.timestamp( entity.getTimestamp() );
        historicalPriceDto.volume( entity.getVolume() );

        return historicalPriceDto.build();
    }

    @Override
    public HistoricalPrice toEntity(HistoricalPriceDto dto) {
        if ( dto == null ) {
            return null;
        }

        HistoricalPrice.HistoricalPriceBuilder historicalPrice = HistoricalPrice.builder();

        historicalPrice.openPrice( dto.getOpen() );
        historicalPrice.highPrice( dto.getHigh() );
        historicalPrice.lowPrice( dto.getLow() );
        historicalPrice.closePrice( dto.getClose() );
        historicalPrice.timestamp( dto.getTimestamp() );
        historicalPrice.volume( dto.getVolume() );

        return historicalPrice.build();
    }

    private String entityStockSymbol(HistoricalPrice historicalPrice) {
        if ( historicalPrice == null ) {
            return null;
        }
        Stock stock = historicalPrice.getStock();
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
