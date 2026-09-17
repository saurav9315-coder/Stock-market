package com.stock.analysis.websocket.controller;

import com.stock.analysis.websocket.model.RealtimeMessage;
import com.stock.analysis.websocket.model.SystemAnnouncementPayload;
import com.stock.analysis.websocket.service.RealtimeEventPublisher;
import com.stock.analysis.websocket.service.WebSocketMetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final RealtimeEventPublisher realtimeEventPublisher;
    private final WebSocketMetricsService metricsService;

    @MessageMapping("/ping")
    @SendTo("/topic/pong")
    public RealtimeMessage<String> handlePing(@Payload String clientTimestamp, Principal principal) {
        metricsService.recordInboundMessage();
        String username = (principal != null) ? principal.getName() : "ANONYMOUS";
        log.debug("STOMP ping received from user {}", username);

        return RealtimeMessage.<String>builder()
                .messageId(UUID.randomUUID().toString())
                .eventType("PONG")
                .destination("/topic/pong")
                .payload("PONG at " + Instant.now().toString())
                .timestamp(Instant.now())
                .build();
    }

    @MessageMapping("/admin/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public void broadcastSystemAnnouncement(@Payload SystemAnnouncementPayload payload) {
        metricsService.recordInboundMessage();
        log.info("Admin broadcasting system announcement: {}", payload.getTitle());

        payload.setAnnouncementId(UUID.randomUUID().toString());
        payload.setCreatedAt(Instant.now());

        realtimeEventPublisher.publishAnnouncement(payload);
    }
}
