package com.stock.analysis.notification.listener;

import com.stock.analysis.ai.event.AiEvents;
import com.stock.analysis.notification.domain.NotificationCategory;
import com.stock.analysis.notification.domain.NotificationPriority;
import com.stock.analysis.notification.domain.NotificationSeverity;
import com.stock.analysis.notification.dto.SendNotificationRequest;
import com.stock.analysis.notification.service.NotificationService;
import com.stock.analysis.trading.event.OrderCancelledEvent;
import com.stock.analysis.trading.event.OrderCreatedEvent;
import com.stock.analysis.trading.event.OrderExecutedEvent;
import com.stock.analysis.trading.event.TradeCompletedEvent;
import com.stock.analysis.wallet.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;

    // --- WALLET EVENTS ---

    @Async
    @EventListener
    public void handleDepositSubmitted(DepositSubmittedEvent event) {
        if (event.getDepositRequest() == null || event.getDepositRequest().getWallet() == null || event.getDepositRequest().getWallet().getUser() == null) return;
        var req = event.getDepositRequest();
        var user = req.getWallet().getUser();

        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(user.getId())
                .category(NotificationCategory.WALLET)
                .priority(NotificationPriority.MEDIUM)
                .severity(NotificationSeverity.INFO)
                .title("Deposit Request Submitted")
                .message("Your deposit request of $" + req.getAmount() + " has been submitted for processing.")
                .referenceUrl("/wallet/history")
                .build();
        notificationService.sendNotification(request);
    }

    @Async
    @EventListener
    public void handleDepositApproved(DepositApprovedEvent event) {
        if (event.getDepositRequest() == null || event.getDepositRequest().getWallet() == null || event.getDepositRequest().getWallet().getUser() == null) return;
        var req = event.getDepositRequest();
        var user = req.getWallet().getUser();

        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(user.getId())
                .category(NotificationCategory.WALLET)
                .priority(NotificationPriority.HIGH)
                .severity(NotificationSeverity.SUCCESS)
                .title("Deposit Approved")
                .message("Your deposit of $" + req.getAmount() + " has been approved and credited to your wallet.")
                .referenceUrl("/wallet")
                .build();
        notificationService.sendNotification(request);
    }

    @Async
    @EventListener
    public void handleDepositRejected(DepositRejectedEvent event) {
        if (event.getDepositRequest() == null || event.getDepositRequest().getWallet() == null || event.getDepositRequest().getWallet().getUser() == null) return;
        var req = event.getDepositRequest();
        var user = req.getWallet().getUser();

        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(user.getId())
                .category(NotificationCategory.WALLET)
                .priority(NotificationPriority.HIGH)
                .severity(NotificationSeverity.DANGER)
                .title("Deposit Rejected")
                .message("Your deposit request of $" + req.getAmount() + " was rejected.")
                .referenceUrl("/wallet/support")
                .build();
        notificationService.sendNotification(request);
    }

    @Async
    @EventListener
    public void handleWithdrawalRequested(WithdrawalRequestedEvent event) {
        if (event.getWithdrawalRequest() == null || event.getWithdrawalRequest().getWallet() == null || event.getWithdrawalRequest().getWallet().getUser() == null) return;
        var req = event.getWithdrawalRequest();
        var user = req.getWallet().getUser();

        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(user.getId())
                .category(NotificationCategory.WALLET)
                .priority(NotificationPriority.MEDIUM)
                .severity(NotificationSeverity.INFO)
                .title("Withdrawal Submitted")
                .message("Your withdrawal request of $" + req.getAmount() + " has been submitted.")
                .referenceUrl("/wallet/history")
                .build();
        notificationService.sendNotification(request);
    }

    @Async
    @EventListener
    public void handleWithdrawalApproved(WithdrawalApprovedEvent event) {
        if (event.getWithdrawalRequest() == null || event.getWithdrawalRequest().getWallet() == null || event.getWithdrawalRequest().getWallet().getUser() == null) return;
        var req = event.getWithdrawalRequest();
        var user = req.getWallet().getUser();

        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(user.getId())
                .category(NotificationCategory.WALLET)
                .priority(NotificationPriority.HIGH)
                .severity(NotificationSeverity.SUCCESS)
                .title("Withdrawal Approved")
                .message("Your withdrawal of $" + req.getAmount() + " has been approved and processed.")
                .referenceUrl("/wallet")
                .build();
        notificationService.sendNotification(request);
    }

    @Async
    @EventListener
    public void handleWithdrawalRejected(WithdrawalRejectedEvent event) {
        if (event.getWithdrawalRequest() == null || event.getWithdrawalRequest().getWallet() == null || event.getWithdrawalRequest().getWallet().getUser() == null) return;
        var req = event.getWithdrawalRequest();
        var user = req.getWallet().getUser();

        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(user.getId())
                .category(NotificationCategory.WALLET)
                .priority(NotificationPriority.HIGH)
                .severity(NotificationSeverity.DANGER)
                .title("Withdrawal Rejected")
                .message("Your withdrawal of $" + req.getAmount() + " was rejected.")
                .referenceUrl("/wallet/support")
                .build();
        notificationService.sendNotification(request);
    }

    // --- TRADING EVENTS ---

    @Async
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        if (event.getOrder() == null || event.getOrder().getUser() == null) return;
        var order = event.getOrder();
        String symbol = order.getStock() != null ? order.getStock().getSymbol() : "N/A";

        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(order.getUser().getId())
                .category(NotificationCategory.TRADING)
                .priority(NotificationPriority.MEDIUM)
                .severity(NotificationSeverity.INFO)
                .title("Order Placed")
                .message(order.getSide() + " order created for " + order.getQuantity() + " shares of " + symbol)
                .referenceUrl("/orders/" + order.getId())
                .build();
        notificationService.sendNotification(request);
    }

    @Async
    @EventListener
    public void handleOrderExecuted(OrderExecutedEvent event) {
        if (event.getOrder() == null || event.getOrder().getUser() == null) return;
        var order = event.getOrder();
        var price = event.getExecution() != null ? event.getExecution().getPrice() : order.getAvgFillPrice();

        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(order.getUser().getId())
                .category(NotificationCategory.TRADING)
                .priority(NotificationPriority.HIGH)
                .severity(NotificationSeverity.SUCCESS)
                .title("Order Executed")
                .message("Order #" + order.getId() + " executed at price $" + price)
                .referenceUrl("/orders/" + order.getId())
                .build();
        notificationService.sendNotification(request);
    }

    @Async
    @EventListener
    public void handleOrderCancelled(OrderCancelledEvent event) {
        if (event.getOrder() == null || event.getOrder().getUser() == null) return;
        var order = event.getOrder();

        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(order.getUser().getId())
                .category(NotificationCategory.TRADING)
                .priority(NotificationPriority.MEDIUM)
                .severity(NotificationSeverity.WARNING)
                .title("Order Cancelled")
                .message("Order #" + order.getId() + " has been cancelled. Reason: " + event.getReason())
                .referenceUrl("/orders")
                .build();
        notificationService.sendNotification(request);
    }

    @Async
    @EventListener
    public void handleTradeCompleted(TradeCompletedEvent event) {
        if (event.getTradeExecution() == null || event.getTradeExecution().getUser() == null) return;
        var trade = event.getTradeExecution();
        String symbol = trade.getStock() != null ? trade.getStock().getSymbol() : "N/A";

        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(trade.getUser().getId())
                .category(NotificationCategory.TRADING)
                .priority(NotificationPriority.HIGH)
                .severity(NotificationSeverity.SUCCESS)
                .title("Trade Completed")
                .message("Trade #" + trade.getId() + " completed for symbol " + symbol)
                .referenceUrl("/trades/" + trade.getId())
                .build();
        notificationService.sendNotification(request);
    }

    // --- AI EVENTS ---

    @Async
    @EventListener
    public void handleAiAnalysisGenerated(AiEvents.AiAnalysisGeneratedEvent event) {
        Map<String, Object> model = new HashMap<>();
        model.put("symbol", event.getSymbol());

        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(event.getUserId())
                .category(NotificationCategory.AI)
                .priority(NotificationPriority.MEDIUM)
                .severity(NotificationSeverity.INFO)
                .title("AI Analysis Complete")
                .message("AI analysis for symbol " + event.getSymbol() + " is ready.")
                .referenceUrl("/ai-analysis?symbol=" + event.getSymbol())
                .templateModel(model)
                .build();
        notificationService.sendNotification(request);
    }

    @Async
    @EventListener
    public void handlePortfolioReviewCompleted(AiEvents.PortfolioReviewCompletedEvent event) {
        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(event.getUserId())
                .category(NotificationCategory.AI)
                .priority(NotificationPriority.MEDIUM)
                .severity(NotificationSeverity.INFO)
                .title("Portfolio Risk Review Completed")
                .message("Your AI portfolio risk score is " + event.getRiskScore() + "/100.")
                .referenceUrl("/portfolio")
                .build();
        notificationService.sendNotification(request);
    }
}
