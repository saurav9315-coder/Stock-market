package com.stock.analysis.websocket.pubsub;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.analysis.websocket.model.RealtimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisMessagePublisher {

    private final StringRedisTemplate redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.websocket.redis-pubsub.enabled:true}")
    private boolean redisPubSubEnabled;

    public <T> void publish(String channelTopic, RealtimeMessage<T> message) {
        if (redisPubSubEnabled) {
            try {
                String jsonPayload = objectMapper.writeValueAsString(message);
                redisTemplate.convertAndSend(channelTopic, jsonPayload);
                log.debug("Published realtime message ID {} to Redis topic {}", message.getMessageId(), channelTopic);
                return;
            } catch (Exception e) {
                log.warn("Redis Pub/Sub unavailable ({}), falling back to local STOMP messaging relay.", e.getMessage());
            }
        }

        // Direct Local STOMP Relay Fallback (for single-instance or test environments)
        relayLocally(message);
    }

    private <T> void relayLocally(RealtimeMessage<T> message) {
        if (message.getTargetUserId() != null && !message.getTargetUserId().isBlank()) {
            messagingTemplate.convertAndSendToUser(message.getTargetUserId(), message.getDestination(), message.getPayload());
        } else if (message.getDestination() != null) {
            messagingTemplate.convertAndSend(message.getDestination(), message.getPayload());
        }
    }
}
