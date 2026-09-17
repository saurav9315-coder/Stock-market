package com.stock.analysis.wallet.service;

import com.stock.analysis.users.User;
import com.stock.analysis.wallet.Wallet;
import com.stock.analysis.wallet.WalletLedger;
import com.stock.analysis.wallet.domain.LedgerType;
import com.stock.analysis.wallet.dto.WalletLedgerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.UUID;

public interface LedgerService {

    WalletLedger recordEntry(Wallet wallet, BigDecimal amount, LedgerType type, BigDecimal balanceAfter, String description, UUID referenceId);

    Page<WalletLedgerResponse> getLedgerForUser(User user, Pageable pageable);
}
