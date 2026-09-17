package com.stock.analysis.ai.service;

import com.stock.analysis.ai.AiDailyUsage;
import com.stock.analysis.ai.exception.AiRateLimitExceededException;
import com.stock.analysis.ai.repository.AiDailyUsageRepository;
import com.stock.analysis.users.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiRateLimiterService {

    private static final int DAILY_REQUEST_LIMIT = 50;
    private final StringRedisTemplate redisTemplate;
    private final AiDailyUsageRepository dailyUsageRepository;

    public void checkAndIncrementQuota(User user, int estimatedTokens) {
        if (user == null || user.getId() == null) {
            return;
        }

        LocalDate today = LocalDate.now();
        String redisKey = "ai:usage:" + user.getId() + ":" + today;

        Long currentCount = redisTemplate.opsForValue().increment(redisKey);
        if (currentCount != null && currentCount == 1) {
            redisTemplate.expire(redisKey, Duration.ofDays(1));
        }

        if (currentCount != null && currentCount > DAILY_REQUEST_LIMIT) {
            log.warn("Daily AI rate limit exceeded for user ID: {} (Count: {})", user.getId(), currentCount);
            throw new AiRateLimitExceededException("Daily AI query limit of " + DAILY_REQUEST_LIMIT + " requests exceeded. Please try again tomorrow.");
        }

        recordUsageInDb(user, today, estimatedTokens);
    }

    @Transactional
    public void recordUsageInDb(User user, LocalDate date, int tokensUsed) {
        dailyUsageRepository.findByUserIdAndUsageDate(user.getId(), date)
                .ifPresentOrElse(
                        usage -> {
                            usage.setRequestCount(usage.getRequestCount() + 1);
                            usage.setTokensUsed(usage.getTokensUsed() + tokensUsed);
                            dailyUsageRepository.save(usage);
                        },
                        () -> {
                            AiDailyUsage usage = AiDailyUsage.builder()
                                    .user(user)
                                    .usageDate(date)
                                    .requestCount(1)
                                    .tokensUsed(tokensUsed)
                                    .createdBy("SYSTEM")
                                    .build();
                            dailyUsageRepository.save(usage);
                        }
                );
    }
}
