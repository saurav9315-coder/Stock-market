package com.stock.analysis.websocket.pubsub;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.analysis.websocket.service.WebSocketMetricsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.connection.DefaultMessage;
import org.springframework.data.redis.connection.Message;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.nio.charset.StandardCharsets;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RedisMessageSubscriberTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private WebSocketMetricsService metricsService;

    @InjectMocks
    private RedisMessageSubscriber redisMessageSubscriber;

    @Test
    @DisplayName("Should route public message to destination topic")
    void testPublicMessageRouting() {
        String json = "{\"destination\":\"/topic/market/prices\",\"payload\":{\"symbol\":\"AAPL\",\"price\":150.0}}";
        Message message = new DefaultMessage("stock:realtime:market".getBytes(StandardCharsets.UTF_8), json.getBytes(StandardCharsets.UTF_8));

        redisMessageSubscriber.onMessage(message, null);

        verify(messagingTemplate).convertAndSend(eq("/topic/market/prices"), any(Object.class));
        verify(metricsService).recordOutboundMessage();
    }

    @Test
    @DisplayName("Should route user message to user queue when targetUserId is specified")
    void testUserMessageRouting() {
        String json = "{\"destination\":\"/queue/orders\",\"targetUserId\":\"user-123\",\"payload\":{\"orderId\":\"abc\"}}";
        Message message = new DefaultMessage("stock:realtime:user".getBytes(StandardCharsets.UTF_8), json.getBytes(StandardCharsets.UTF_8));

        redisMessageSubscriber.onMessage(message, null);

        verify(messagingTemplate).convertAndSendToUser(eq("user-123"), eq("/queue/orders"), any(Object.class));
        verify(metricsService).recordOutboundMessage();
    }

    @Test
    @DisplayName("Should handle null message gracefully")
    void testNullMessageHandling() {
        redisMessageSubscriber.onMessage(null, null);

        verify(messagingTemplate, never()).convertAndSend(any(), any(Object.class));
        verify(messagingTemplate, never()).convertAndSendToUser(any(), any(), any(Object.class));
    }

    @Test
    @DisplayName("Should record failed delivery on malformed JSON")
    void testMalformedJsonHandling() {
        String json = "{invalid-json}";
        Message message = new DefaultMessage("stock:realtime:market".getBytes(StandardCharsets.UTF_8), json.getBytes(StandardCharsets.UTF_8));

        redisMessageSubscriber.onMessage(message, null);

        verify(metricsService).recordFailedDelivery();
    }
}
