package com.stock.analysis.trading.mapper;

import com.stock.analysis.market.Stock;
import com.stock.analysis.portfolio.Order;
import com.stock.analysis.portfolio.Portfolio;
import com.stock.analysis.trading.dto.OrderResponse;
import com.stock.analysis.users.User;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-01T18:49:57+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class OrderMapperImpl implements OrderMapper {

    @Override
    public OrderResponse toDto(Order order) {
        if ( order == null ) {
            return null;
        }

        OrderResponse.OrderResponseBuilder orderResponse = OrderResponse.builder();

        orderResponse.userId( orderUserId( order ) );
        orderResponse.username( orderUserUsername( order ) );
        orderResponse.portfolioId( orderPortfolioId( order ) );
        orderResponse.stockId( orderStockId( order ) );
        orderResponse.stockSymbol( orderStockSymbol( order ) );
        orderResponse.stockName( orderStockName( order ) );
        orderResponse.avgFillPrice( order.getAvgFillPrice() );
        orderResponse.cancelledAt( order.getCancelledAt() );
        orderResponse.cancelledReason( order.getCancelledReason() );
        orderResponse.clientOrderId( order.getClientOrderId() );
        orderResponse.createdAt( order.getCreatedAt() );
        orderResponse.expiresAt( order.getExpiresAt() );
        orderResponse.filledAt( order.getFilledAt() );
        orderResponse.filledQuantity( order.getFilledQuantity() );
        orderResponse.id( order.getId() );
        orderResponse.limitPrice( order.getLimitPrice() );
        orderResponse.orderType( order.getOrderType() );
        orderResponse.quantity( order.getQuantity() );
        orderResponse.rejectedReason( order.getRejectedReason() );
        orderResponse.side( order.getSide() );
        orderResponse.status( order.getStatus() );
        orderResponse.stopPrice( order.getStopPrice() );
        orderResponse.totalAmount( order.getTotalAmount() );
        orderResponse.totalFee( order.getTotalFee() );
        orderResponse.tradingMode( order.getTradingMode() );
        orderResponse.triggerPrice( order.getTriggerPrice() );

        return orderResponse.build();
    }

    private UUID orderUserId(Order order) {
        if ( order == null ) {
            return null;
        }
        User user = order.getUser();
        if ( user == null ) {
            return null;
        }
        UUID id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String orderUserUsername(Order order) {
        if ( order == null ) {
            return null;
        }
        User user = order.getUser();
        if ( user == null ) {
            return null;
        }
        String username = user.getUsername();
        if ( username == null ) {
            return null;
        }
        return username;
    }

    private UUID orderPortfolioId(Order order) {
        if ( order == null ) {
            return null;
        }
        Portfolio portfolio = order.getPortfolio();
        if ( portfolio == null ) {
            return null;
        }
        UUID id = portfolio.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private UUID orderStockId(Order order) {
        if ( order == null ) {
            return null;
        }
        Stock stock = order.getStock();
        if ( stock == null ) {
            return null;
        }
        UUID id = stock.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String orderStockSymbol(Order order) {
        if ( order == null ) {
            return null;
        }
        Stock stock = order.getStock();
        if ( stock == null ) {
            return null;
        }
        String symbol = stock.getSymbol();
        if ( symbol == null ) {
            return null;
        }
        return symbol;
    }

    private String orderStockName(Order order) {
        if ( order == null ) {
            return null;
        }
        Stock stock = order.getStock();
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
