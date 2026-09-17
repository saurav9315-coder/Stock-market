package com.stock.analysis.admin.service;

import com.stock.analysis.admin.dto.FinancialOperationDtos.*;
import com.stock.analysis.exception.ResourceNotFoundException;
import com.stock.analysis.wallet.DepositRequest;
import com.stock.analysis.wallet.WalletBalance;
import com.stock.analysis.wallet.WithdrawalRequest;
import com.stock.analysis.wallet.domain.DepositStatus;
import com.stock.analysis.wallet.domain.WithdrawalStatus;
import com.stock.analysis.wallet.repository.DepositRequestRepository;
import com.stock.analysis.wallet.repository.WalletBalanceRepository;
import com.stock.analysis.wallet.repository.WithdrawalRequestRepository;
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
public class AdminFinancialOperationsService {

    private final DepositRequestRepository depositRequestRepository;
    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final WalletBalanceRepository walletBalanceRepository;

    @Transactional(readOnly = true)
    public Page<DepositReviewDto> getDeposits(DepositStatus status, Pageable pageable) {
        Page<DepositRequest> page;
        if (status != null) {
            page = depositRequestRepository.findByStatus(status, pageable);
        } else {
            page = depositRequestRepository.findAll(pageable);
        }

        return page.map(dep -> DepositReviewDto.builder()
                .id(dep.getId())
                .userId(dep.getWallet().getUser().getId())
                .username(dep.getWallet().getUser().getUsername())
                .email(dep.getWallet().getUser().getEmail())
                .amount(dep.getAmount())
                .currency(dep.getWallet().getCurrency())
                .paymentMethod(dep.getBankAccount() != null ? "BANK_TRANSFER" : "WIRE_TRANSFER")
                .transactionReference(dep.getTransactionReference())
                .proofImageUrl(dep.getPaymentProof() != null ? dep.getPaymentProof().getFileUrl() : null)
                .status(dep.getStatus() != null ? dep.getStatus().name() : "PENDING")
                .notes(dep.getAdminNotes())
                .createdAt(dep.getCreatedAt())
                .build());
    }

    @Transactional
    public void processDeposit(UUID depositId, DepositActionRequest request) {
        DepositRequest deposit = depositRequestRepository.findById(depositId)
                .orElseThrow(() -> new ResourceNotFoundException("Deposit request not found: " + depositId));

        if (deposit.getStatus() != DepositStatus.PENDING) {
            throw new IllegalStateException("Deposit request is already processed: " + deposit.getStatus());
        }

        String action = request.getAction().toUpperCase();
        if ("APPROVE".equals(action)) {
            deposit.setStatus(DepositStatus.APPROVED);
            deposit.setAdminNotes(request.getInternalNotes());

            // Credit wallet available balance
            WalletBalance balance = walletBalanceRepository.findByWalletId(deposit.getWallet().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet balance not found for wallet: " + deposit.getWallet().getId()));

            balance.setAvailableBalance(balance.getAvailableBalance().add(deposit.getAmount()));
            walletBalanceRepository.save(balance);

            log.info("Admin APPROVED deposit {}: credited {} to wallet {}", depositId, deposit.getAmount(), deposit.getWallet().getId());
        } else if ("REJECT".equals(action)) {
            deposit.setStatus(DepositStatus.REJECTED);
            deposit.setRejectionReason(request.getReason());
            deposit.setAdminNotes(request.getInternalNotes());
            log.info("Admin REJECTED deposit {}: reason={}", depositId, request.getReason());
        }
        depositRequestRepository.save(deposit);
    }

    @Transactional(readOnly = true)
    public Page<WithdrawalReviewDto> getWithdrawals(WithdrawalStatus status, Pageable pageable) {
        Page<WithdrawalRequest> page;
        if (status != null) {
            page = withdrawalRequestRepository.findByStatus(status, pageable);
        } else {
            page = withdrawalRequestRepository.findAll(pageable);
        }

        return page.map(w -> WithdrawalReviewDto.builder()
                .id(w.getId())
                .userId(w.getWallet().getUser().getId())
                .username(w.getWallet().getUser().getUsername())
                .email(w.getWallet().getUser().getEmail())
                .amount(w.getAmount())
                .fee(BigDecimal.ZERO)
                .netAmount(w.getAmount())
                .currency(w.getWallet().getCurrency())
                .bankName(w.getBankAccount() != null ? w.getBankAccount().getBankName() : null)
                .accountNumber(w.getBankAccount() != null ? w.getBankAccount().getAccountNumber() : null)
                .accountHolderName(w.getBankAccount() != null ? w.getBankAccount().getAccountHolderName() : null)
                .status(w.getStatus() != null ? w.getStatus().name() : "PENDING")
                .internalNotes(w.getAdminNotes())
                .createdAt(w.getCreatedAt())
                .build());
    }

    @Transactional
    public void processWithdrawal(UUID withdrawalId, WithdrawalActionRequest request) {
        WithdrawalRequest withdrawal = withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal request not found: " + withdrawalId));

        String action = request.getAction().toUpperCase();
        if ("APPROVE".equals(action)) {
            withdrawal.setStatus(WithdrawalStatus.APPROVED);
            withdrawal.setAdminNotes(request.getInternalNotes());
            log.info("Admin APPROVED withdrawal {}", withdrawalId);
        } else if ("MARK_PROCESSING".equals(action)) {
            withdrawal.setStatus(WithdrawalStatus.PROCESSING);
            withdrawal.setAdminNotes(request.getInternalNotes());
            log.info("Admin marked withdrawal {} as PROCESSING", withdrawalId);
        } else if ("MARK_COMPLETED".equals(action)) {
            withdrawal.setStatus(WithdrawalStatus.COMPLETED);
            withdrawal.setAdminNotes(request.getInternalNotes());

            // Deduct locked balance permanently
            WalletBalance balance = walletBalanceRepository.findByWalletId(withdrawal.getWallet().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet balance not found"));

            BigDecimal lockToDeduct = withdrawal.getAmount();
            if (balance.getLockedBalance().compareTo(lockToDeduct) >= 0) {
                balance.setLockedBalance(balance.getLockedBalance().subtract(lockToDeduct));
            } else {
                balance.setLockedBalance(BigDecimal.ZERO);
            }
            walletBalanceRepository.save(balance);

            log.info("Admin COMPLETED withdrawal {}", withdrawalId);
        } else if ("REJECT".equals(action)) {
            withdrawal.setStatus(WithdrawalStatus.REJECTED);
            withdrawal.setRejectionReason(request.getReason());
            withdrawal.setAdminNotes(request.getInternalNotes());

            // Refund locked balance back to available balance
            WalletBalance balance = walletBalanceRepository.findByWalletId(withdrawal.getWallet().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet balance not found"));

            BigDecimal amountToRefund = withdrawal.getAmount();
            if (balance.getLockedBalance().compareTo(amountToRefund) >= 0) {
                balance.setLockedBalance(balance.getLockedBalance().subtract(amountToRefund));
            } else {
                balance.setLockedBalance(BigDecimal.ZERO);
            }
            balance.setAvailableBalance(balance.getAvailableBalance().add(amountToRefund));
            walletBalanceRepository.save(balance);

            log.info("Admin REJECTED withdrawal {}: refunded {} to available balance", withdrawalId, amountToRefund);
        }
        withdrawalRequestRepository.save(withdrawal);
    }
}
