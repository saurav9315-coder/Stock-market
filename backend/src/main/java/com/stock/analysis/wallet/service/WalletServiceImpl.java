package com.stock.analysis.wallet.service;

import com.stock.analysis.users.User;
import com.stock.analysis.wallet.TransactionHistory;
import com.stock.analysis.wallet.Wallet;
import com.stock.analysis.wallet.WalletBalance;
import com.stock.analysis.wallet.dto.TransactionHistoryResponse;
import com.stock.analysis.wallet.dto.WalletResponse;
import com.stock.analysis.wallet.event.WalletBalanceUpdatedEvent;
import com.stock.analysis.wallet.exception.InsufficientBalanceException;
import com.stock.analysis.wallet.exception.WalletException;
import com.stock.analysis.wallet.repository.TransactionHistoryRepository;
import com.stock.analysis.wallet.repository.WalletBalanceRepository;
import com.stock.analysis.wallet.repository.WalletRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final WalletBalanceRepository walletBalanceRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    public WalletServiceImpl(
            @Qualifier("walletDomainRepository") WalletRepository walletRepository,
            @Qualifier("walletBalanceDomainRepository") WalletBalanceRepository walletBalanceRepository,
            @Qualifier("walletTransactionHistoryRepository") TransactionHistoryRepository transactionHistoryRepository,
            ApplicationEventPublisher eventPublisher) {
        this.walletRepository = walletRepository;
        this.walletBalanceRepository = walletBalanceRepository;
        this.transactionHistoryRepository = transactionHistoryRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    @Override
    public Wallet getOrCreateWallet(User user) {
        return walletRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    log.info("Creating new wallet for user: {}", user.getUsername());
                    Wallet wallet = Wallet.builder()
                            .user(user)
                            .currency("USD")
                            .createdBy(user.getUsername())
                            .build();
                    wallet = walletRepository.save(wallet);

                    WalletBalance balance = WalletBalance.builder()
                            .wallet(wallet)
                            .availableBalance(BigDecimal.ZERO)
                            .lockedBalance(BigDecimal.ZERO)
                            .createdBy(user.getUsername())
                            .build();
                    walletBalanceRepository.save(balance);
                    return wallet;
                });
    }

    @Transactional(readOnly = true)
    @Override
    public WalletResponse getWalletDetails(User user) {
        Wallet wallet = getOrCreateWallet(user);
        WalletBalance balance = walletBalanceRepository.findByWalletId(wallet.getId())
                .orElseThrow(() -> new WalletException("Wallet balance not found for user: " + user.getUsername()));

        BigDecimal available = balance.getAvailableBalance() != null ? balance.getAvailableBalance() : BigDecimal.ZERO;
        BigDecimal locked = balance.getLockedBalance() != null ? balance.getLockedBalance() : BigDecimal.ZERO;
        BigDecimal total = available.add(locked);

        return WalletResponse.builder()
                .walletId(wallet.getId())
                .userId(user.getId())
                .availableBalance(available)
                .lockedBalance(locked)
                .totalBalance(total)
                .currency(wallet.getCurrency())
                .build();
    }

    @Transactional
    @Override
    public WalletBalance creditAvailableBalance(Wallet wallet, BigDecimal amount) {
        WalletBalance balance = walletBalanceRepository.findByWalletIdWithLock(wallet.getId())
                .orElseThrow(() -> new WalletException("Wallet balance record missing"));

        BigDecimal currentAvailable = balance.getAvailableBalance() != null ? balance.getAvailableBalance() : BigDecimal.ZERO;
        balance.setAvailableBalance(currentAvailable.add(amount));
        balance = walletBalanceRepository.save(balance);

        eventPublisher.publishEvent(new WalletBalanceUpdatedEvent(this, wallet, balance.getAvailableBalance(), balance.getLockedBalance()));
        return balance;
    }

    @Transactional
    @Override
    public WalletBalance lockBalance(Wallet wallet, BigDecimal amount) {
        WalletBalance balance = walletBalanceRepository.findByWalletIdWithLock(wallet.getId())
                .orElseThrow(() -> new WalletException("Wallet balance record missing"));

        BigDecimal currentAvailable = balance.getAvailableBalance() != null ? balance.getAvailableBalance() : BigDecimal.ZERO;
        if (currentAvailable.compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient available balance to lock " + amount);
        }

        BigDecimal currentLocked = balance.getLockedBalance() != null ? balance.getLockedBalance() : BigDecimal.ZERO;
        balance.setAvailableBalance(currentAvailable.subtract(amount));
        balance.setLockedBalance(currentLocked.add(amount));
        balance = walletBalanceRepository.save(balance);

        eventPublisher.publishEvent(new WalletBalanceUpdatedEvent(this, wallet, balance.getAvailableBalance(), balance.getLockedBalance()));
        return balance;
    }

    @Transactional
    @Override
    public WalletBalance unlockBalance(Wallet wallet, BigDecimal amount) {
        WalletBalance balance = walletBalanceRepository.findByWalletIdWithLock(wallet.getId())
                .orElseThrow(() -> new WalletException("Wallet balance record missing"));

        BigDecimal currentLocked = balance.getLockedBalance() != null ? balance.getLockedBalance() : BigDecimal.ZERO;
        if (currentLocked.compareTo(amount) < 0) {
            throw new WalletException("Locked balance is less than requested unlock amount");
        }

        BigDecimal currentAvailable = balance.getAvailableBalance() != null ? balance.getAvailableBalance() : BigDecimal.ZERO;
        balance.setLockedBalance(currentLocked.subtract(amount));
        balance.setAvailableBalance(currentAvailable.add(amount));
        balance = walletBalanceRepository.save(balance);

        eventPublisher.publishEvent(new WalletBalanceUpdatedEvent(this, wallet, balance.getAvailableBalance(), balance.getLockedBalance()));
        return balance;
    }

    @Transactional
    @Override
    public WalletBalance deductLockedBalance(Wallet wallet, BigDecimal amount) {
        WalletBalance balance = walletBalanceRepository.findByWalletIdWithLock(wallet.getId())
                .orElseThrow(() -> new WalletException("Wallet balance record missing"));

        BigDecimal currentLocked = balance.getLockedBalance() != null ? balance.getLockedBalance() : BigDecimal.ZERO;
        if (currentLocked.compareTo(amount) < 0) {
            throw new WalletException("Locked balance is less than requested deduction amount");
        }

        balance.setLockedBalance(currentLocked.subtract(amount));
        balance = walletBalanceRepository.save(balance);

        eventPublisher.publishEvent(new WalletBalanceUpdatedEvent(this, wallet, balance.getAvailableBalance(), balance.getLockedBalance()));
        return balance;
    }

    @Transactional
    @Override
    public TransactionHistory recordTransactionHistory(Wallet wallet, String type, BigDecimal amount, String status, BigDecimal fee, String referenceType, UUID referenceId) {
        TransactionHistory history = TransactionHistory.builder()
                .wallet(wallet)
                .type(type)
                .amount(amount)
                .status(status)
                .fee(fee != null ? fee : BigDecimal.ZERO)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .createdBy(wallet.getUser() != null ? wallet.getUser().getUsername() : "SYSTEM")
                .build();
        return transactionHistoryRepository.save(history);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<TransactionHistoryResponse> getTransactionHistory(User user, String type, String status, Instant startDate, Instant endDate, Pageable pageable) {
        Page<TransactionHistory> page = transactionHistoryRepository.findFilteredHistory(user.getId(), type, status, startDate, endDate, pageable);
        return page.map(th -> TransactionHistoryResponse.builder()
                .id(th.getId())
                .walletId(th.getWallet().getId())
                .type(th.getType())
                .amount(th.getAmount())
                .status(th.getStatus())
                .fee(th.getFee())
                .referenceType(th.getReferenceType())
                .referenceId(th.getReferenceId())
                .createdAt(th.getCreatedAt())
                .build());
    }
}
