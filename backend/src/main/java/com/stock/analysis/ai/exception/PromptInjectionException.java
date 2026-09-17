package com.stock.analysis.ai.exception;

import com.stock.analysis.exception.BaseException;
import org.springframework.http.HttpStatus;

public class PromptInjectionException extends BaseException {
    public PromptInjectionException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "PROMPT_INJECTION_DETECTED");
    }
}
