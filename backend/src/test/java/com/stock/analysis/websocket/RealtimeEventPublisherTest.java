package com.stock.analysis.websocket;

import com.stock.analysis.websocket.config.RedisPubSubConfig;
import com.stock.analysis.websocket.model.MarketStreamPayload;
import com.stock.analysis.websocket.model.NotificationStreamPayload;
import com.stock.analysis.websocket.model.OrderStreamPayload;
import com.stock.analysis.websocket.model.PortfolioStreamPayload;
import com.stock.analysis.websocket.model.RealtimeMessage;
import com.stock.analysis.websocket.model.SystemAnnouncementPayload;
import com.stock.analysis.websocket.model.WalletStreamPayload;
import com.stock.analysis.websocket.pubsub.RedisMessagePublisher;
import com.stock.analysis.websocket.service.RealtimeEventPublisher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RealtimeEventPublisherTest {

    @Mock
    private RedisMessagePublisher redisMessagePublisher;

    @InjectMocks
    private RealtimeEventPublisher realtimeEventPublisher;

    @Captor
    private ArgumentCaptor<RealtimeMessage<MarketStreamPayload>> marketMessageCaptor;

    @Captor
    private ArgumentCaptor<RealtimeMessage<OrderStreamPayload>> orderMessageCaptor;

    @Captor
    private ArgumentCaptor<RealtimeMessage<PortfolioStreamPayload>> portfolioMessageCaptor;

    @Captor
    private ArgumentCaptor<RealtimeMessage<WalletStreamPayload>> walletMessageCaptor;

    @Captor
    private ArgumentCaptor<RealtimeMessage<NotificationStreamPayload>> notificationMessageCaptor;

    @Captor
    private ArgumentCaptor<RealtimeMessage<SystemAnnouncementPayload>> announcementMessageCaptor;

    @Test
    @DisplayName("Should publish market price update to MARKET_TOPIC channel")
    void testPublishMarketUpdate() {
        MarketStreamPayload payload = MarketStreamPayload.builder()
                .symbol("AAPL")
                .name("Apple Inc.")
                .price(BigDecimal.valueOf(185.50))
                .change(BigDecimal.valueOf(1.20))
                .changePercent(BigDecimal.valueOf(0.65))
                .category("STOCK")
                .timestamp(Instant.now())
                .build();

        realtimeEventPublisher.publishMarketUpdate(payload);

        verify(redisMessagePublisher).publish(eq(RedisPubSubConfig.MARKET_TOPIC), marketMessageCaptor.capture());
        RealtimeMessage<MarketStreamPayload> message = marketMessageCaptor.getValue();

        assertNotNull(message.getMessageId());
        assertEquals("MARKET_TICK", message.getEventType());
        assertEquals("/topic/market/prices", message.getDestination());
        assertEquals(payload, message.getPayload());
    }

    @Test
    @DisplayName("Should publish user order update to USER_TOPIC channel")
    void testPublishOrderUpdate() {
        UUID userId = UUID.randomUUID();
        OrderStreamPayload payload = OrderStreamPayload.builder()
                .orderId(UUID.randomUUID())
                .userId(userId)
                .symbol("AAPL")
                .orderType("LIMIT")
                .orderSide("BUY")
                .status("FILLED")
                .totalQuantity(BigDecimal.TEN)
                .filledQuantity(BigDecimal.TEN)
                .price(BigDecimal.valueOf(185.00))
                .executionPrice(BigDecimal.valueOf(184.95))
                .updatedAt(Instant.now())
                .build();

        realtimeEventPublisher.publishOrderUpdate(userId.toString(), payload);

        verify(redisMessagePublisher).publish(eq(RedisPubSubConfig.USER_TOPIC), orderMessageCaptor.capture());
        RealtimeMessage<OrderStreamPayload> message = orderMessageCaptor.getValue();

        assertNotNull(message.getMessageId());
        assertEquals("ORDER_UPDATE", message.getEventType());
        assertEquals("/queue/orders", message.getDestination());
        assertEquals(userId.toString(), message.getTargetUserId());
        assertEquals(payload, message.getPayload());
    }

    @Test
    @DisplayName("Should publish portfolio update to USER_TOPIC channel")
    void testPublishPortfolioUpdate() {
        UUID userId = UUID.randomUUID();
        PortfolioStreamPayload payload = PortfolioStreamPayload.builder()
                .portfolioId(UUID.randomUUID())
                .userId(userId)
                .totalValue(BigDecimal.valueOf(10000.00))
                .unrealizedPnl(BigDecimal.valueOf(500.00))
                .triggerEvent("PRICE_CHANGE")
                .build();

        realtimeEventPublisher.publishPortfolioUpdate(userId.toString(), payload);

        verify(redisMessagePublisher).publish(eq(RedisPubSubConfig.USER_TOPIC), portfolioMessageCaptor.capture());
        RealtimeMessage<PortfolioStreamPayload> message = portfolioMessageCaptor.getValue();

        assertNotNull(message.getMessageId());
        assertEquals("PORTFOLIO_UPDATE", message.getEventType());
        assertEquals("/queue/portfolio", message.getDestination());
        assertEquals(userId.toString(), message.getTargetUserId());
        assertEquals(payload, message.getPayload());
    }

    @Test
    @DisplayName("Should publish wallet update to USER_TOPIC channel")
    void testPublishWalletUpdate() {
        UUID userId = UUID.randomUUID();
        WalletStreamPayload payload = WalletStreamPayload.builder()
                .walletId(UUID.randomUUID())
                .userId(userId)
                .availableBalance(BigDecimal.valueOf(2500.00))
                .totalBalance(BigDecimal.valueOf(3000.00))
                .transactionType("DEPOSIT_APPROVED")
                .timestamp(Instant.now())
                .build();

        realtimeEventPublisher.publishWalletUpdate(userId.toString(), payload);

        verify(redisMessagePublisher).publish(eq(RedisPubSubConfig.USER_TOPIC), walletMessageCaptor.capture());
        RealtimeMessage<WalletStreamPayload> message = walletMessageCaptor.getValue();

        assertNotNull(message.getMessageId());
        assertEquals("WALLET_UPDATE", message.getEventType());
        assertEquals("/queue/wallet", message.getDestination());
        assertEquals(userId.toString(), message.getTargetUserId());
        assertEquals(payload, message.getPayload());
    }

    @Test
    @DisplayName("Should publish notification to USER_TOPIC channel")
    void testPublishNotification() {
        UUID userId = UUID.randomUUID();
        NotificationStreamPayload payload = NotificationStreamPayload.builder()
                .notificationId(UUID.randomUUID())
                .userId(userId)
                .category("PRICE_ALERT")
                .title("Price Alert Triggered")
                .message("AAPL crossed target price")
                .severity("INFO")
                .createdAt(Instant.now())
                .build();

        realtimeEventPublisher.publishNotification(userId.toString(), payload);

        verify(redisMessagePublisher).publish(eq(RedisPubSubConfig.USER_TOPIC), notificationMessageCaptor.capture());
        RealtimeMessage<NotificationStreamPayload> message = notificationMessageCaptor.getValue();

        assertNotNull(message.getMessageId());
        assertEquals("NOTIFICATION", message.getEventType());
        assertEquals("/queue/notifications", message.getDestination());
        assertEquals(userId.toString(), message.getTargetUserId());
        assertEquals(payload, message.getPayload());
    }

    @Test
    @DisplayName("Should publish system announcement to ADMIN_TOPIC channel")
    void testPublishAnnouncement() {
        SystemAnnouncementPayload payload = SystemAnnouncementPayload.builder()
                .announcementId(UUID.randomUUID().toString())
                .title("System Maintenance")
                .content("Scheduled maintenance tonight")
                .announcementType("MAINTENANCE")
                .createdAt(Instant.now())
                .build();

        realtimeEventPublisher.publishAnnouncement(payload);

        verify(redisMessagePublisher).publish(eq(RedisPubSubConfig.ADMIN_TOPIC), announcementMessageCaptor.capture());
        RealtimeMessage<SystemAnnouncementPayload> message = announcementMessageCaptor.getValue();

        assertNotNull(message.getMessageId());
        assertEquals("ANNOUNCEMENT", message.getEventType());
        assertEquals("/topic/admin/announcements", message.getDestination());
        assertEquals(payload, message.getPayload());
    }
}

