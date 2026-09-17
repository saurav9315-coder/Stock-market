package com.stock.analysis.wallet.exception;

import org.springframework.http.HttpStatus;

public class InsufficientBalanceException extends WalletException {
    public InsufficientBalanceException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, "INSUFFICIENT_BALANCE");
    }
}

