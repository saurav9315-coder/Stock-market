package com.stock.analysis.exception;

import org.springframework.http.HttpStatus;

public class EmailNotVerifiedException extends BaseException {

    public EmailNotVerifiedException(String message) {
        super(message, HttpStatus.FORBIDDEN, "EMAIL_NOT_VERIFIED");
    }
}
