package com.stock.analysis.wallet.service;

import com.stock.analysis.kyc.KycRequest;
import com.stock.analysis.kyc.KycRequestRepository;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.BankAccount;
import com.stock.analysis.wallet.Wallet;
import com.stock.analysis.wallet.WalletBalance;
import com.stock.analysis.wallet.WithdrawalRequest;
import com.stock.analysis.wallet.domain.LedgerType;
import com.stock.analysis.wallet.domain.WithdrawalStatus;
import com.stock.analysis.wallet.dto.AdminApprovalRequest;
import com.stock.analysis.wallet.dto.WithdrawalCreateRequest;
import com.stock.analysis.wallet.dto.WithdrawalResponse;
import com.stock.analysis.wallet.event.WithdrawalApprovedEvent;
import com.stock.analysis.wallet.event.WithdrawalRejectedEvent;
import com.stock.analysis.wallet.event.WithdrawalRequestedEvent;
import com.stock.analysis.wallet.exception.DailyLimitExceededException;
import com.stock.analysis.wallet.exception.KycNotVerifiedException;
import com.stock.analysis.wallet.exception.WalletException;
import com.stock.analysis.wallet.repository.BankAccountRepository;
import com.stock.analysis.wallet.repository.WithdrawalRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WithdrawalServiceImpl implements WithdrawalService {

    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final BankAccountRepository bankAccountRepository;
    private final KycRequestRepository kycRequestRepository;
    private final WalletService walletService;
    private final LedgerService ledgerService;
    private final AuditService auditService;
    private final ApplicationEventPublisher eventPublisher;

    private static final BigDecimal DAILY_WITHDRAWAL_LIMIT = new BigDecimal("50000.0000");

    @Transactional
    @Override
    public WithdrawalResponse submitWithdrawal(User user, WithdrawalCreateRequest request) {
        log.info("User {} requesting withdrawal of amount {} {}", user.getUsername(), request.getAmount(), request.getCurrency());

        // 1. Validate KYC Status
        Optional<KycRequest> kycOpt = kycRequestRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId());
        if (kycOpt.isEmpty() || !"APPROVED".equalsIgnoreCase(kycOpt.get().getStatus())) {
            throw new KycNotVerifiedException("Withdrawal failed: Approved KYC is required before placing a withdrawal request");
        }

        // 2. Validate Bank Account
        BankAccount bankAccount = bankAccountRepository.findByIdAndUserId(request.getBankAccountId(), user.getId())
                .orElseThrow(() -> new WalletException("Invalid or unverified bank account provided for withdrawal"));

        // 3. Validate Daily Limit
        Instant past24Hours = Instant.now().minus(24, ChronoUnit.HOURS);
        BigDecimal total24h = withdrawalRequestRepository.sumTotalWithdrawnSince(user.getId(), past24Hours);
        if (total24h.add(request.getAmount()).compareTo(DAILY_WITHDRAWAL_LIMIT) > 0) {
            throw new DailyLimitExceededException("Daily withdrawal limit of " + DAILY_WITHDRAWAL_LIMIT + " exceeded");
        }

        // 4. Lock balance in wallet (validates sufficient available balance)
        Wallet wallet = walletService.getOrCreateWallet(user);
        walletService.lockBalance(wallet, request.getAmount());

        // 5. Create Withdrawal Request
        WithdrawalRequest withdrawal = WithdrawalRequest.builder()
                .wallet(wallet)
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .status(WithdrawalStatus.PENDING)
                .bankAccount(bankAccount)
                .createdBy(user.getUsername())
                .build();

        withdrawal = withdrawalRequestRepository.save(withdrawal);

        walletService.recordTransactionHistory(wallet, "WITHDRAWAL", request.getAmount(), "PENDING", BigDecimal.ZERO, "WITHDRAWAL_REQUEST", withdrawal.getId());
        auditService.logAction(user, "WITHDRAWAL_REQUESTED", "WITHDRAWAL_REQUEST", withdrawal.getId(), "Withdrawal requested for amount " + request.getAmount(), null);
        eventPublisher.publishEvent(new WithdrawalRequestedEvent(this, withdrawal));

        return mapToResponse(withdrawal);
    }

    @Transactional
    @Override
    public WithdrawalResponse approveWithdrawal(UUID withdrawalId, AdminApprovalRequest request, User admin) {
        log.info("Admin {} approving withdrawal ID: {}", admin.getUsername(), withdrawalId);

        WithdrawalRequest withdrawal = withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new WalletException("Withdrawal request not found: " + withdrawalId));

        if (withdrawal.getStatus() != WithdrawalStatus.PENDING && withdrawal.getStatus() != WithdrawalStatus.PROCESSING) {
            throw new WalletException("Only PENDING or PROCESSING withdrawal requests can be approved. Current status: " + withdrawal.getStatus());
        }

        withdrawal.setStatus(WithdrawalStatus.COMPLETED);
        withdrawal.setAdminNotes(request != null ? request.getAdminNotes() : null);
        withdrawal = withdrawalRequestRepository.save(withdrawal);

        Wallet wallet = withdrawal.getWallet();

        // Financial Ledger & Deduct Locked Balance
        WalletBalance balance = walletService.deductLockedBalance(wallet, withdrawal.getAmount());
        ledgerService.recordEntry(wallet, withdrawal.getAmount(), LedgerType.DEBIT, balance.getAvailableBalance(), "Withdrawal Completed: Ref " + withdrawal.getId(), withdrawal.getId());
        walletService.recordTransactionHistory(wallet, "WITHDRAWAL", withdrawal.getAmount(), "COMPLETED", BigDecimal.ZERO, "WITHDRAWAL_REQUEST", withdrawal.getId());

        auditService.logAction(admin, "WITHDRAWAL_APPROVED", "WITHDRAWAL_REQUEST", withdrawal.getId(), "Withdrawal approved by admin: " + admin.getUsername(), null);
        eventPublisher.publishEvent(new WithdrawalApprovedEvent(this, withdrawal));

        return mapToResponse(withdrawal);
    }

    @Transactional
    @Override
    public WithdrawalResponse rejectWithdrawal(UUID withdrawalId, AdminApprovalRequest request, User admin) {
        log.info("Admin {} rejecting withdrawal ID: {}", admin.getUsername(), withdrawalId);

        WithdrawalRequest withdrawal = withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new WalletException("Withdrawal request not found: " + withdrawalId));

        if (withdrawal.getStatus() != WithdrawalStatus.PENDING && withdrawal.getStatus() != WithdrawalStatus.PROCESSING) {
            throw new WalletException("Only PENDING or PROCESSING withdrawal requests can be rejected. Current status: " + withdrawal.getStatus());
        }

        withdrawal.setStatus(WithdrawalStatus.REJECTED);
        if (request != null) {
            withdrawal.setRejectionReason(request.getRejectionReason());
            withdrawal.setAdminNotes(request.getAdminNotes());
        }
        withdrawal = withdrawalRequestRepository.save(withdrawal);

        Wallet wallet = withdrawal.getWallet();

        // Unlock Balance back to available
        walletService.unlockBalance(wallet, withdrawal.getAmount());
        walletService.recordTransactionHistory(wallet, "WITHDRAWAL", withdrawal.getAmount(), "CANCELLED", BigDecimal.ZERO, "WITHDRAWAL_REQUEST", withdrawal.getId());

        auditService.logAction(admin, "WITHDRAWAL_REJECTED", "WITHDRAWAL_REQUEST", withdrawal.getId(), "Withdrawal rejected by admin: " + admin.getUsername(), null);
        eventPublisher.publishEvent(new WithdrawalRejectedEvent(this, withdrawal));

        return mapToResponse(withdrawal);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<WithdrawalResponse> getPendingWithdrawals(Pageable pageable) {
        return withdrawalRequestRepository.findByStatus(WithdrawalStatus.PENDING, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<WithdrawalResponse> getUserWithdrawals(User user, Pageable pageable) {
        return withdrawalRequestRepository.findByWalletUserId(user.getId(), pageable).map(this::mapToResponse);
    }

    private WithdrawalResponse mapToResponse(WithdrawalRequest req) {
        return WithdrawalResponse.builder()
                .id(req.getId())
                .walletId(req.getWallet().getId())
                .amount(req.getAmount())
                .currency(req.getCurrency())
                .status(req.getStatus())
                .bankAccountId(req.getBankAccount().getId())
                .rejectionReason(req.getRejectionReason())
                .adminNotes(req.getAdminNotes())
                .createdAt(req.getCreatedAt())
                .build();
    }
}
