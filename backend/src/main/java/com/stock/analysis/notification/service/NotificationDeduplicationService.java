package com.stock.analysis.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationDeduplicationService {

    private final StringRedisTemplate redisTemplate;

    public boolean isDuplicate(UUID userId, String category, String title, String message, Duration window) {
        String hashKey = generateHash(userId + ":" + category + ":" + title + ":" + message);
        String redisKey = "notification:dedup:" + hashKey;

        try {
            Boolean setIfAbsent = redisTemplate.opsForValue().setIfAbsent(redisKey, "1", window);
            if (Boolean.FALSE.equals(setIfAbsent)) {
                log.warn("Duplicate notification detected for user {} in category {}. Suppressing delivery.", userId, category);
                return true;
            }
        } catch (Exception e) {
            log.warn("Redis deduplication check unavailable ({}), bypassing check.", e.getMessage());
        }
        return false;
    }

    private String generateHash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            return Integer.toHexString(input.hashCode());
        }
    }
}
