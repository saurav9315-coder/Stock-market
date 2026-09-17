package com.stock.analysis.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationRateLimiterService {

    private final StringRedisTemplate redisTemplate;
    private static final int MAX_NOTIFICATIONS_PER_HOUR = 100;

    public boolean isRateLimited(UUID userId) {
        String redisKey = "notification:ratelimit:" + userId;
        try {
            Long currentCount = redisTemplate.opsForValue().increment(redisKey);
            if (currentCount != null && currentCount == 1) {
                redisTemplate.expire(redisKey, Duration.ofHours(1));
            }
            if (currentCount != null && currentCount > MAX_NOTIFICATIONS_PER_HOUR) {
                log.warn("Rate limit exceeded for user {}: {} notifications sent in current hour.", userId, currentCount);
                return true;
            }
        } catch (Exception e) {
            log.warn("Redis rate limiter check failed ({}), bypassing check.", e.getMessage());
        }
        return false;
    }
}
