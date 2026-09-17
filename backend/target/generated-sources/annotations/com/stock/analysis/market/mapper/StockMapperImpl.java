package com.stock.analysis.market.mapper;

import com.stock.analysis.market.Exchange;
import com.stock.analysis.market.Stock;
import com.stock.analysis.market.dto.StockDto;
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
public class StockMapperImpl implements StockMapper {

    @Override
    public List<Stock> toEntityList(List<StockDto> dtoList) {
        if ( dtoList == null ) {
            return null;
        }

        List<Stock> list = new ArrayList<Stock>( dtoList.size() );
        for ( StockDto stockDto : dtoList ) {
            list.add( toEntity( stockDto ) );
        }

        return list;
    }

    @Override
    public List<StockDto> toDtoList(List<Stock> entityList) {
        if ( entityList == null ) {
            return null;
        }

        List<StockDto> list = new ArrayList<StockDto>( entityList.size() );
        for ( Stock stock : entityList ) {
            list.add( toDto( stock ) );
        }

        return list;
    }

    @Override
    public void updateEntityFromDto(StockDto dto, Stock entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getId() != null ) {
            entity.setId( dto.getId() );
        }
        entity.setActive( dto.isActive() );
        if ( dto.getName() != null ) {
            entity.setName( dto.getName() );
        }
        if ( dto.getSymbol() != null ) {
            entity.setSymbol( dto.getSymbol() );
        }
    }

    @Override
    public StockDto toDto(Stock entity) {
        if ( entity == null ) {
            return null;
        }

        StockDto.StockDtoBuilder stockDto = StockDto.builder();

        stockDto.exchangeCode( entityExchangeCode( entity ) );
        stockDto.active( entity.isActive() );
        stockDto.id( entity.getId() );
        stockDto.name( entity.getName() );
        stockDto.symbol( entity.getSymbol() );

        return stockDto.build();
    }

    @Override
    public Stock toEntity(StockDto dto) {
        if ( dto == null ) {
            return null;
        }

        Stock.StockBuilder<?, ?> stock = Stock.builder();

        stock.id( dto.getId() );
        stock.active( dto.isActive() );
        stock.name( dto.getName() );
        stock.symbol( dto.getSymbol() );

        return stock.build();
    }

    private String entityExchangeCode(Stock stock) {
        if ( stock == null ) {
            return null;
        }
        Exchange exchange = stock.getExchange();
        if ( exchange == null ) {
            return null;
        }
        String code = exchange.getCode();
        if ( code == null ) {
            return null;
        }
        return code;
    }
}
