package com.stock.analysis.notification;

import com.stock.analysis.ai.event.AiEvents;
import com.stock.analysis.notification.dto.SendNotificationRequest;
import com.stock.analysis.notification.listener.NotificationEventListener;
import com.stock.analysis.notification.service.NotificationService;
import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.event.OrderCreatedEvent;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.DepositRequest;
import com.stock.analysis.wallet.Wallet;
import com.stock.analysis.wallet.event.DepositApprovedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationEventListenerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationEventListener eventListener;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should process DepositApprovedEvent and delegate to NotificationService")
    void testHandleDepositApproved() {
        User user = User.builder().id(userId).username("testuser").build();
        Wallet wallet = Wallet.builder().id(UUID.randomUUID()).user(user).build();
        DepositRequest depositRequest = DepositRequest.builder()
                .id(UUID.randomUUID())
                .wallet(wallet)
                .amount(new BigDecimal("500.00"))
                .currency("USD")
                .build();
        DepositApprovedEvent event = new DepositApprovedEvent(this, depositRequest);

        eventListener.handleDepositApproved(event);

        verify(notificationService).sendNotification(any(SendNotificationRequest.class));
    }

    @Test
    @DisplayName("Should process OrderCreatedEvent and delegate to NotificationService")
    void testHandleOrderCreated() {
        User user = User.builder().id(userId).username("testuser").build();
        Order order = Order.builder()
                .id(UUID.randomUUID())
                .user(user)
                .quantity(new BigDecimal("10"))
                .build();
        OrderCreatedEvent event = new OrderCreatedEvent(this, order);

        eventListener.handleOrderCreated(event);

        verify(notificationService).sendNotification(any(SendNotificationRequest.class));
    }

    @Test
    @DisplayName("Should process AiAnalysisGeneratedEvent and delegate to NotificationService")
    void testHandleAiAnalysisGenerated() {
        AiEvents.AiAnalysisGeneratedEvent event = new AiEvents.AiAnalysisGeneratedEvent(this, userId, "MSFT", "BULLISH");

        eventListener.handleAiAnalysisGenerated(event);

        verify(notificationService).sendNotification(any(SendNotificationRequest.class));
    }
}
