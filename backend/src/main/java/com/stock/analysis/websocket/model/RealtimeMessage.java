package com.stock.analysis.websocket.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RealtimeMessage<T> {

    @Builder.Default
    private String messageId = UUID.randomUUID().toString();

    private String eventType; // MARKET_TICK, ORDER_UPDATE, WALLET_UPDATE, PORTFOLIO_UPDATE, NOTIFICATION, ANNOUNCEMENT

    private String destination;

    private String targetUserId; // null for public broadcast

    private T payload;

    @Builder.Default
    private Instant timestamp = Instant.now();
}
