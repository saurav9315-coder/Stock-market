package com.stock.analysis.websocket.service;

import com.stock.analysis.websocket.config.RedisPubSubConfig;
import com.stock.analysis.websocket.model.MarketStreamPayload;
import com.stock.analysis.websocket.model.NotificationStreamPayload;
import com.stock.analysis.websocket.model.OrderStreamPayload;
import com.stock.analysis.websocket.model.PortfolioStreamPayload;
import com.stock.analysis.websocket.model.RealtimeMessage;
import com.stock.analysis.websocket.model.SystemAnnouncementPayload;
import com.stock.analysis.websocket.model.WalletStreamPayload;
import com.stock.analysis.websocket.pubsub.RedisMessagePublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RealtimeEventPublisher {

    private final RedisMessagePublisher redisPublisher;

    public void publishMarketUpdate(MarketStreamPayload payload) {
        RealtimeMessage<MarketStreamPayload> msg = RealtimeMessage.<MarketStreamPayload>builder()
                .messageId(UUID.randomUUID().toString())
                .eventType("MARKET_TICK")
                .destination("/topic/market/prices")
                .payload(payload)
                .build();
        redisPublisher.publish(RedisPubSubConfig.MARKET_TOPIC, msg);
    }

    public void publishPortfolioUpdate(String userId, PortfolioStreamPayload payload) {
        RealtimeMessage<PortfolioStreamPayload> msg = RealtimeMessage.<PortfolioStreamPayload>builder()
                .messageId(UUID.randomUUID().toString())
                .eventType("PORTFOLIO_UPDATE")
                .destination("/queue/portfolio")
                .targetUserId(userId)
                .payload(payload)
                .build();
        redisPublisher.publish(RedisPubSubConfig.USER_TOPIC, msg);
    }

    public void publishOrderUpdate(String userId, OrderStreamPayload payload) {
        RealtimeMessage<OrderStreamPayload> msg = RealtimeMessage.<OrderStreamPayload>builder()
                .messageId(UUID.randomUUID().toString())
                .eventType("ORDER_UPDATE")
                .destination("/queue/orders")
                .targetUserId(userId)
                .payload(payload)
                .build();
        redisPublisher.publish(RedisPubSubConfig.USER_TOPIC, msg);
    }

    public void publishWalletUpdate(String userId, WalletStreamPayload payload) {
        RealtimeMessage<WalletStreamPayload> msg = RealtimeMessage.<WalletStreamPayload>builder()
                .messageId(UUID.randomUUID().toString())
                .eventType("WALLET_UPDATE")
                .destination("/queue/wallet")
                .targetUserId(userId)
                .payload(payload)
                .build();
        redisPublisher.publish(RedisPubSubConfig.USER_TOPIC, msg);
    }

    public void publishNotification(String userId, NotificationStreamPayload payload) {
        RealtimeMessage<NotificationStreamPayload> msg = RealtimeMessage.<NotificationStreamPayload>builder()
                .messageId(UUID.randomUUID().toString())
                .eventType("NOTIFICATION")
                .destination("/queue/notifications")
                .targetUserId(userId)
                .payload(payload)
                .build();
        redisPublisher.publish(RedisPubSubConfig.USER_TOPIC, msg);
    }

    public void publishAnnouncement(SystemAnnouncementPayload payload) {
        RealtimeMessage<SystemAnnouncementPayload> msg = RealtimeMessage.<SystemAnnouncementPayload>builder()
                .messageId(UUID.randomUUID().toString())
                .eventType("ANNOUNCEMENT")
                .destination("/topic/admin/announcements")
                .payload(payload)
                .build();
        redisPublisher.publish(RedisPubSubConfig.ADMIN_TOPIC, msg);
    }
}
