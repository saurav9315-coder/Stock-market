package com.stock.analysis.websocket;

import com.stock.analysis.security.CustomUserDetailsService;
import com.stock.analysis.security.jwt.JwtTokenProvider;
import com.stock.analysis.websocket.config.WebSocketAuthInterceptor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class WebSocketAuthInterceptorTest {

    private JwtTokenProvider tokenProvider;
    private CustomUserDetailsService userDetailsService;
    private WebSocketAuthInterceptor interceptor;

    @BeforeEach
    void setUp() {
        tokenProvider = mock(JwtTokenProvider.class);
        userDetailsService = mock(CustomUserDetailsService.class);
        interceptor = new WebSocketAuthInterceptor(tokenProvider, userDetailsService);
    }

    @Test
    @DisplayName("Should authenticate connection with valid Bearer token in headers")
    void testValidTokenConnect() {
        String token = "valid-jwt-token";
        String username = "trader123";

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setNativeHeader("Authorization", "Bearer " + token);
        accessor.setLeaveMutable(true);
        Message<byte[]> message = (Message<byte[]>) MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        when(tokenProvider.validateToken(token)).thenReturn(true);
        when(tokenProvider.getUsernameFromJWT(token)).thenReturn(username);

        UserDetails userDetails = new User(username, "password", Collections.emptyList());
        when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);

        MessageChannel channel = mock(MessageChannel.class);
        Message<?> result = interceptor.preSend(message, channel);

        assertNotNull(result);
        StompHeaderAccessor resultAccessor = StompHeaderAccessor.wrap(result);
        assertNotNull(resultAccessor.getUser());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when token is missing")
    void testMissingTokenConnect() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setLeaveMutable(true);
        Message<byte[]> message = (Message<byte[]>) MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        MessageChannel channel = mock(MessageChannel.class);

        assertThrows(IllegalArgumentException.class, () -> interceptor.preSend(message, channel));
    }
}
