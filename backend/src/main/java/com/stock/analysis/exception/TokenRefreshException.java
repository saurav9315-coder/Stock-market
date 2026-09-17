package com.stock.analysis.exception;

import org.springframework.http.HttpStatus;

public class TokenRefreshException extends BaseException {

    public TokenRefreshException(String token, String message) {
        super(String.format("Failed for [%s]: %s", token, message), HttpStatus.FORBIDDEN, "TOKEN_REFRESH_FAILED");
    }
}
