package com.stock.analysis.users;

import java.util.Collections;
import java.util.Set;

public enum Role {
    ROLE_GUEST(Collections.emptySet()),
    
    ROLE_USER(Set.of(
            Permission.USER_READ,
            Permission.USER_WRITE,
            Permission.PORTFOLIO_READ,
            Permission.PORTFOLIO_WRITE,
            Permission.WALLET_READ,
            Permission.WALLET_WRITE
    )),
    
    ROLE_VERIFIED_USER(Set.of(
            Permission.USER_READ,
            Permission.USER_WRITE,
            Permission.PORTFOLIO_READ,
            Permission.PORTFOLIO_WRITE,
            Permission.WALLET_READ,
            Permission.WALLET_WRITE
    )),
    
    ROLE_ADMIN(Set.of(
            Permission.USER_READ,
            Permission.USER_WRITE,
            Permission.PORTFOLIO_READ,
            Permission.PORTFOLIO_WRITE,
            Permission.WALLET_READ,
            Permission.WALLET_WRITE,
            Permission.ADMIN_READ
    )),
    
    ROLE_SUPER_ADMIN(Set.of(
            Permission.USER_READ,
            Permission.USER_WRITE,
            Permission.PORTFOLIO_READ,
            Permission.PORTFOLIO_WRITE,
            Permission.WALLET_READ,
            Permission.WALLET_WRITE,
            Permission.ADMIN_READ,
            Permission.ADMIN_WRITE
    ));

    private final Set<Permission> permissions;

    Role(Set<Permission> permissions) {
        this.permissions = permissions;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }
}
