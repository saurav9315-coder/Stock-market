package com.stock.analysis.exception;

import org.springframework.http.HttpStatus;

public class PasswordPolicyException extends BaseException {

    public PasswordPolicyException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "PASSWORD_POLICY_VIOLATION");
    }
}
