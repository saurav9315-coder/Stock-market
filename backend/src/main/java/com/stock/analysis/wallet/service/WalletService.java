package com.stock.analysis.wallet.service;

import com.stock.analysis.users.User;
import com.stock.analysis.wallet.TransactionHistory;
import com.stock.analysis.wallet.Wallet;
import com.stock.analysis.wallet.WalletBalance;
import com.stock.analysis.wallet.dto.TransactionHistoryResponse;
import com.stock.analysis.wallet.dto.WalletResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public interface WalletService {

    Wallet getOrCreateWallet(User user);

    WalletResponse getWalletDetails(User user);

    WalletBalance creditAvailableBalance(Wallet wallet, BigDecimal amount);

    WalletBalance lockBalance(Wallet wallet, BigDecimal amount);

    WalletBalance unlockBalance(Wallet wallet, BigDecimal amount);

    WalletBalance deductLockedBalance(Wallet wallet, BigDecimal amount);

    TransactionHistory recordTransactionHistory(Wallet wallet, String type, BigDecimal amount, String status, BigDecimal fee, String referenceType, UUID referenceId);

    Page<TransactionHistoryResponse> getTransactionHistory(User user, String type, String status, Instant startDate, Instant endDate, Pageable pageable);
}
