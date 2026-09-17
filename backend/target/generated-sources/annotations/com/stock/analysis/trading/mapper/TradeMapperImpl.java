package com.stock.analysis.trading.mapper;

import com.stock.analysis.market.Stock;
import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.dto.TradeExecutionResponse;
import com.stock.analysis.trading.entity.TradeExecution;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-01T18:49:57+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class TradeMapperImpl implements TradeMapper {

    @Override
    public TradeExecutionResponse toDto(TradeExecution execution) {
        if ( execution == null ) {
            return null;
        }

        TradeExecutionResponse.TradeExecutionResponseBuilder tradeExecutionResponse = TradeExecutionResponse.builder();

        tradeExecutionResponse.buyOrderId( executionBuyOrderId( execution ) );
        tradeExecutionResponse.sellOrderId( executionSellOrderId( execution ) );
        tradeExecutionResponse.stockId( executionStockId( execution ) );
        tradeExecutionResponse.stockSymbol( executionStockSymbol( execution ) );
        tradeExecutionResponse.stockName( executionStockName( execution ) );
        tradeExecutionResponse.executedAt( execution.getExecutedAt() );
        tradeExecutionResponse.fee( execution.getFee() );
        tradeExecutionResponse.id( execution.getId() );
        tradeExecutionResponse.price( execution.getPrice() );
        tradeExecutionResponse.quantity( execution.getQuantity() );
        tradeExecutionResponse.side( execution.getSide() );
        tradeExecutionResponse.totalValue( execution.getTotalValue() );
        tradeExecutionResponse.tradeNumber( execution.getTradeNumber() );
        tradeExecutionResponse.tradingMode( execution.getTradingMode() );

        return tradeExecutionResponse.build();
    }

    private UUID executionBuyOrderId(TradeExecution tradeExecution) {
        if ( tradeExecution == null ) {
            return null;
        }
        Order buyOrder = tradeExecution.getBuyOrder();
        if ( buyOrder == null ) {
            return null;
        }
        UUID id = buyOrder.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private UUID executionSellOrderId(TradeExecution tradeExecution) {
        if ( tradeExecution == null ) {
            return null;
        }
        Order sellOrder = tradeExecution.getSellOrder();
        if ( sellOrder == null ) {
            return null;
        }
        UUID id = sellOrder.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private UUID executionStockId(TradeExecution tradeExecution) {
        if ( tradeExecution == null ) {
            return null;
        }
        Stock stock = tradeExecution.getStock();
        if ( stock == null ) {
            return null;
        }
        UUID id = stock.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String executionStockSymbol(TradeExecution tradeExecution) {
        if ( tradeExecution == null ) {
            return null;
        }
        Stock stock = tradeExecution.getStock();
        if ( stock == null ) {
            return null;
        }
        String symbol = stock.getSymbol();
        if ( symbol == null ) {
            return null;
        }
        return symbol;
    }

    private String executionStockName(TradeExecution tradeExecution) {
        if ( tradeExecution == null ) {
            return null;
        }
        Stock stock = tradeExecution.getStock();
        if ( stock == null ) {
            return null;
        }
        String name = stock.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
