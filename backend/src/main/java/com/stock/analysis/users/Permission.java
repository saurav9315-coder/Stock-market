package com.stock.analysis.users;

public enum Permission {
    USER_READ("USER_READ"),
    USER_WRITE("USER_WRITE"),
    PORTFOLIO_READ("PORTFOLIO_READ"),
    PORTFOLIO_WRITE("PORTFOLIO_WRITE"),
    WALLET_READ("WALLET_READ"),
    WALLET_WRITE("WALLET_WRITE"),
    ADMIN_READ("ADMIN_READ"),
    ADMIN_WRITE("ADMIN_WRITE");

    private final String value;

    Permission(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
