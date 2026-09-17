package com.stock.analysis.wallet.exception;

import com.stock.analysis.exception.BaseException;
import org.springframework.http.HttpStatus;

public class WalletException extends BaseException {
    public WalletException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "WALLET_ERROR");
    }

    public WalletException(String message, HttpStatus status, String errorCode) {
        super(message, status, errorCode);
    }

    public WalletException(String message, Throwable cause) {
        super(message, cause, HttpStatus.BAD_REQUEST, "WALLET_ERROR");
    }
}

