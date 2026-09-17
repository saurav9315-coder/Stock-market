package com.stock.analysis.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.slf4j.MDC;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private int status;
    private String message;
    private T data;
    private Instant timestamp;
    private String requestId;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .status(200)
                .message("Operation completed successfully")
                .data(data)
                .timestamp(Instant.now())
                .requestId(MDC.get("requestId"))
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .status(200)
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .requestId(MDC.get("requestId"))
                .build();
    }

    public static <T> ApiResponse<T> error(int status, String message) {
        return ApiResponse.<T>builder()
                .status(status)
                .message(message)
                .timestamp(Instant.now())
                .requestId(MDC.get("requestId"))
                .build();
    }

    public static <T> ApiResponse<T> error(int status, String message, T errors) {
        return ApiResponse.<T>builder()
                .status(status)
                .message(message)
                .data(errors)
                .timestamp(Instant.now())
                .requestId(MDC.get("requestId"))
                .build();
    }
}
