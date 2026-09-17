package com.stock.analysis.security.jwt;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class TokenBlacklistService {

    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";
    private final RedisTemplate<String, Object> redisTemplate;

    public TokenBlacklistService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Blacklists a token for a given duration.
     *
     * @param token - the JWT token to blacklist
     * @param ttlMs - duration in milliseconds for the token to remain in the blacklist
     */
    public void blacklistToken(String token, long ttlMs) {
        if (ttlMs > 0) {
            String key = BLACKLIST_PREFIX + token;
            redisTemplate.opsForValue().set(key, "blacklisted", ttlMs, TimeUnit.MILLISECONDS);
        }
    }

    /**
     * Checks if a token is in the blacklist.
     *
     * @param token - the JWT token to check
     * @return true if blacklisted, false otherwise
     */
    public boolean isTokenBlacklisted(String token) {
        String key = BLACKLIST_PREFIX + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}
