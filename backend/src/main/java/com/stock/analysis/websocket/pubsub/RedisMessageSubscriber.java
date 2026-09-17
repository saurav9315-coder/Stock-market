package com.stock.analysis.websocket.pubsub;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.analysis.websocket.service.WebSocketMetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisMessageSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;
    private final WebSocketMetricsService metricsService;

    @Override
    @SuppressWarnings("null")
    public void onMessage(Message message, byte[] pattern) {
        if (message == null || message.getBody() == null) {
            log.warn("Received null or empty Redis message.");
            return;
        }

        try {
            String messageBody = new String(message.getBody(), StandardCharsets.UTF_8);
            JsonNode root = objectMapper.readTree(messageBody);

            String destination = root.path("destination").asText(null);
            String targetUserId = root.path("targetUserId").asText(null);
            JsonNode payload = root.path("payload");

            if (targetUserId != null && !targetUserId.isBlank() && !targetUserId.equalsIgnoreCase("null")) {
                // User-private destination
                messagingTemplate.convertAndSendToUser(targetUserId, destination, payload);
                log.debug("Relayed user message to {} via STOMP user queue {}", targetUserId, destination);
            } else if (destination != null && !destination.isBlank()) {
                // Public broadcast topic
                messagingTemplate.convertAndSend(destination, payload);
                log.debug("Relayed public broadcast message to STOMP topic {}", destination);
            }

            metricsService.recordOutboundMessage();

        } catch (Exception e) {
            log.error("Error processing Redis message relay: {}", e.getMessage(), e);
            metricsService.recordFailedDelivery();
        }
    }
}

