package com.stock.analysis.wallet.service;

import com.stock.analysis.users.User;
import com.stock.analysis.wallet.Wallet;
import com.stock.analysis.wallet.WalletLedger;
import com.stock.analysis.wallet.domain.LedgerType;
import com.stock.analysis.wallet.dto.WalletLedgerResponse;
import com.stock.analysis.wallet.repository.WalletLedgerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LedgerServiceImpl implements LedgerService {

    private final WalletLedgerRepository walletLedgerRepository;

    @Transactional
    @Override
    public WalletLedger recordEntry(Wallet wallet, BigDecimal amount, LedgerType type, BigDecimal balanceAfter, String description, UUID referenceId) {
        log.info("Recording Immutable Double-Entry Ledger: WalletId={}, Amount={}, Type={}, BalanceAfter={}, RefId={}",
                wallet.getId(), amount, type, balanceAfter, referenceId);

        WalletLedger ledger = WalletLedger.builder()
                .wallet(wallet)
                .amount(amount)
                .type(type.name())
                .balanceAfter(balanceAfter)
                .description(description)
                .referenceId(referenceId)
                .createdBy(wallet.getUser() != null ? wallet.getUser().getUsername() : "SYSTEM")
                .build();

        return walletLedgerRepository.save(ledger);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<WalletLedgerResponse> getLedgerForUser(User user, Pageable pageable) {
        Page<WalletLedger> page = walletLedgerRepository.findByWalletUserId(user.getId(), pageable);
        return page.map(ledger -> WalletLedgerResponse.builder()
                .id(ledger.getId())
                .walletId(ledger.getWallet().getId())
                .amount(ledger.getAmount())
                .type(ledger.getType())
                .balanceAfter(ledger.getBalanceAfter())
                .description(ledger.getDescription())
                .referenceId(ledger.getReferenceId())
                .createdAt(ledger.getCreatedAt())
                .build());
    }
}
