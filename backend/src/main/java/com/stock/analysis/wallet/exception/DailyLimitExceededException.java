package com.stock.analysis.wallet.exception;

public class DailyLimitExceededException extends WalletException {
    public DailyLimitExceededException(String message) {
        super(message);
    }
}
