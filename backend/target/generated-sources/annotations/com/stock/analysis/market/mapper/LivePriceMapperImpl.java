package com.stock.analysis.market.mapper;

import com.stock.analysis.market.LivePriceCache;
import com.stock.analysis.market.Stock;
import com.stock.analysis.market.dto.LivePriceDto;
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
public class LivePriceMapperImpl implements LivePriceMapper {

    @Override
    public List<LivePriceCache> toEntityList(List<LivePriceDto> dtoList) {
        if ( dtoList == null ) {
            return null;
        }

        List<LivePriceCache> list = new ArrayList<LivePriceCache>( dtoList.size() );
        for ( LivePriceDto livePriceDto : dtoList ) {
            list.add( toEntity( livePriceDto ) );
        }

        return list;
    }

    @Override
    public List<LivePriceDto> toDtoList(List<LivePriceCache> entityList) {
        if ( entityList == null ) {
            return null;
        }

        List<LivePriceDto> list = new ArrayList<LivePriceDto>( entityList.size() );
        for ( LivePriceCache livePriceCache : entityList ) {
            list.add( toDto( livePriceCache ) );
        }

        return list;
    }

    @Override
    public void updateEntityFromDto(LivePriceDto dto, LivePriceCache entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getChangeAmount() != null ) {
            entity.setChangeAmount( dto.getChangeAmount() );
        }
        if ( dto.getChangePercent() != null ) {
            entity.setChangePercent( dto.getChangePercent() );
        }
        if ( dto.getLastUpdatedAt() != null ) {
            entity.setLastUpdatedAt( dto.getLastUpdatedAt() );
        }
        if ( dto.getPrice() != null ) {
            entity.setPrice( dto.getPrice() );
        }
        if ( dto.getVolume() != null ) {
            entity.setVolume( dto.getVolume() );
        }
    }

    @Override
    public LivePriceDto toDto(LivePriceCache entity) {
        if ( entity == null ) {
            return null;
        }

        LivePriceDto.LivePriceDtoBuilder livePriceDto = LivePriceDto.builder();

        livePriceDto.symbol( entityStockSymbol( entity ) );
        livePriceDto.bid( entity.getBidPrice() );
        livePriceDto.ask( entity.getAskPrice() );
        livePriceDto.changeAmount( entity.getChangeAmount() );
        livePriceDto.changePercent( entity.getChangePercent() );
        livePriceDto.lastUpdatedAt( entity.getLastUpdatedAt() );
        livePriceDto.price( entity.getPrice() );
        livePriceDto.volume( entity.getVolume() );

        return livePriceDto.build();
    }

    @Override
    public LivePriceCache toEntity(LivePriceDto dto) {
        if ( dto == null ) {
            return null;
        }

        LivePriceCache.LivePriceCacheBuilder<?, ?> livePriceCache = LivePriceCache.builder();

        livePriceCache.bidPrice( dto.getBid() );
        livePriceCache.askPrice( dto.getAsk() );
        livePriceCache.changeAmount( dto.getChangeAmount() );
        livePriceCache.changePercent( dto.getChangePercent() );
        livePriceCache.lastUpdatedAt( dto.getLastUpdatedAt() );
        livePriceCache.price( dto.getPrice() );
        livePriceCache.volume( dto.getVolume() );

        return livePriceCache.build();
    }

    private String entityStockSymbol(LivePriceCache livePriceCache) {
        if ( livePriceCache == null ) {
            return null;
        }
        Stock stock = livePriceCache.getStock();
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
