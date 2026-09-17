package com.stock.analysis.market.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;

@Slf4j
@Service
public class CacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    public CacheService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void put(String key, Object value, Duration ttl) {
        try {
            redisTemplate.opsForValue().set(key, value, ttl);
        } catch (Exception ex) {
            log.warn("Failed to set value in Redis cache for key {}: {}", key, ex.getMessage());
        }
    }

    public Object get(String key) {
        try {
            return redisTemplate.opsForValue().get(key);
        } catch (Exception ex) {
            log.warn("Failed to get value from Redis cache for key {}: {}", key, ex.getMessage());
            return null;
        }
    }

    public void evict(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception ex) {
            log.warn("Failed to delete key from Redis cache {}: {}", key, ex.getMessage());
        }
    }

    public void incrementStockView(String symbol) {
        try {
            redisTemplate.opsForZSet().incrementScore("stocks:most_viewed", symbol, 1);
        } catch (Exception ex) {
            log.warn("Failed to increment stock view in Redis for symbol {}: {}", symbol, ex.getMessage());
        }
    }

    public Set<Object> getMostViewedStocks(long limit) {
        try {
            return redisTemplate.opsForZSet().reverseRange("stocks:most_viewed", 0, limit - 1);
        } catch (Exception ex) {
            log.warn("Failed to fetch most viewed stocks from Redis: {}", ex.getMessage());
            return Set.of();
        }
    }
}
