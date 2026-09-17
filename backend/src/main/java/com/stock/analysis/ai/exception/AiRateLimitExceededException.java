package com.stock.analysis.ai.exception;

import com.stock.analysis.exception.BaseException;
import org.springframework.http.HttpStatus;

public class AiRateLimitExceededException extends BaseException {
    public AiRateLimitExceededException(String message) {
        super(message, HttpStatus.TOO_MANY_REQUESTS, "AI_RATE_LIMIT_EXCEEDED");
    }
}
