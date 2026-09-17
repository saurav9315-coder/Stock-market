package com.stock.analysis.exception;

import org.springframework.http.HttpStatus;

public class AccountLockedException extends BaseException {

    public AccountLockedException(String message) {
        super(message, HttpStatus.LOCKED, "ACCOUNT_LOCKED");
    }
}
