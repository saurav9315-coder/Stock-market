package com.stock.analysis.ai.exception;

import com.stock.analysis.exception.BaseException;
import org.springframework.http.HttpStatus;

public class AiServiceException extends BaseException {
    public AiServiceException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, "AI_SERVICE_ERROR");
    }

    public AiServiceException(String message, Throwable cause) {
        super(message, cause, HttpStatus.INTERNAL_SERVER_ERROR, "AI_SERVICE_ERROR");
    }
}
