package com.stock.analysis.websocket.config;

import com.stock.analysis.websocket.pubsub.RedisMessageSubscriber;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

@Configuration
public class RedisPubSubConfig {

    public static final String MARKET_TOPIC = "stock:realtime:market";
    public static final String USER_TOPIC = "stock:realtime:user";
    public static final String ADMIN_TOPIC = "stock:realtime:admin";

    @Bean
    public ChannelTopic marketChannelTopic() {
        return new ChannelTopic(MARKET_TOPIC);
    }

    @Bean
    public ChannelTopic userChannelTopic() {
        return new ChannelTopic(USER_TOPIC);
    }

    @Bean
    public ChannelTopic adminChannelTopic() {
        return new ChannelTopic(ADMIN_TOPIC);
    }

    @Bean
    @ConditionalOnProperty(name = "app.websocket.redis-pubsub.enabled", havingValue = "true", matchIfMissing = true)
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            RedisMessageSubscriber subscriber,
            ChannelTopic marketChannelTopic,
            ChannelTopic userChannelTopic,
            ChannelTopic adminChannelTopic) {

        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(subscriber, marketChannelTopic);
        container.addMessageListener(subscriber, userChannelTopic);
        container.addMessageListener(subscriber, adminChannelTopic);
        return container;
    }
}

