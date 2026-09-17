package com.stock.analysis.ai.exception;

import com.stock.analysis.exception.BaseException;
import org.springframework.http.HttpStatus;

public class AiProviderUnavailableException extends BaseException {
    public AiProviderUnavailableException(String message) {
        super(message, HttpStatus.SERVICE_UNAVAILABLE, "AI_PROVIDER_UNAVAILABLE");
    }
}
