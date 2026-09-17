package com.stock.analysis.notification.scheduler;

import com.stock.analysis.notification.domain.NotificationCategory;
import com.stock.analysis.notification.domain.NotificationPriority;
import com.stock.analysis.notification.domain.NotificationSeverity;
import com.stock.analysis.notification.dto.SendNotificationRequest;
import com.stock.analysis.notification.service.NotificationService;
import com.stock.analysis.users.User;
import com.stock.analysis.users.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Daily Market Summary at 6:00 PM EST (Mon-Fri)
     */
    @Scheduled(cron = "0 0 18 * * MON-FRI")
    public void scheduleDailyMarketSummary() {
        log.info("Running scheduled job: Daily Market Summary");
        int page = 0;
        Page<User> users;

        do {
            users = userRepository.findAll(PageRequest.of(page, 100));
            for (User user : users.getContent()) {
                SendNotificationRequest request = SendNotificationRequest.builder()
                        .userId(user.getId())
                        .category(NotificationCategory.MARKET)
                        .priority(NotificationPriority.LOW)
                        .severity(NotificationSeverity.INFO)
                        .title("Daily Market Closing Summary")
                        .message("Market closed. Review today's top gainers, losers, and index trends.")
                        .referenceUrl("/market")
                        .build();
                notificationService.sendNotification(request);
            }
            page++;
        } while (users.hasNext());
    }

    /**
     * Weekly Portfolio Report every Sunday at 9:00 AM
     */
    @Scheduled(cron = "0 0 9 * * SUN")
    public void scheduleWeeklyPortfolioReport() {
        log.info("Running scheduled job: Weekly Portfolio Report");
        int page = 0;
        Page<User> users;

        do {
            users = userRepository.findAll(PageRequest.of(page, 100));
            for (User user : users.getContent()) {
                Map<String, Object> model = new HashMap<>();
                model.put("templateName", "weekly-portfolio-summary.html");

                SendNotificationRequest request = SendNotificationRequest.builder()
                        .userId(user.getId())
                        .category(NotificationCategory.PORTFOLIO)
                        .priority(NotificationPriority.MEDIUM)
                        .severity(NotificationSeverity.INFO)
                        .title("Your Weekly Portfolio Performance Report")
                        .message("Your weekly portfolio analysis and risk summary is ready.")
                        .referenceUrl("/portfolio")
                        .templateModel(model)
                        .build();
                notificationService.sendNotification(request);
            }
            page++;
        } while (users.hasNext());
    }

    /**
     * Monthly Performance Report on the 1st of every month at 9:00 AM
     */
    @Scheduled(cron = "0 0 9 1 * *")
    public void scheduleMonthlyPerformanceReport() {
        log.info("Running scheduled job: Monthly Performance Report");
        int page = 0;
        Page<User> users;

        do {
            users = userRepository.findAll(PageRequest.of(page, 100));
            for (User user : users.getContent()) {
                Map<String, Object> model = new HashMap<>();
                model.put("templateName", "monthly-performance-report.html");

                SendNotificationRequest request = SendNotificationRequest.builder()
                        .userId(user.getId())
                        .category(NotificationCategory.PORTFOLIO)
                        .priority(NotificationPriority.HIGH)
                        .severity(NotificationSeverity.INFO)
                        .title("Monthly Trading & Portfolio Statement")
                        .message("Your monthly trading performance statement is ready for download.")
                        .referenceUrl("/portfolio/statements")
                        .templateModel(model)
                        .build();
                notificationService.sendNotification(request);
            }
            page++;
        } while (users.hasNext());
    }

    /**
     * Upcoming Earnings & Dividend Scanner daily at 8:00 AM
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void scheduleUpcomingEarningsAndDividendsAlerts() {
        log.info("Running scheduled job: Upcoming Earnings & Dividends Scanner");
        // Scans watchlists/portfolios for upcoming earnings and dividends
    }
}
