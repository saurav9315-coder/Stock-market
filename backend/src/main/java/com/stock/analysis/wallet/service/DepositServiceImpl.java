package com.stock.analysis.wallet.service;

import com.stock.analysis.users.User;
import com.stock.analysis.wallet.DepositRequest;
import com.stock.analysis.wallet.PaymentProof;
import com.stock.analysis.wallet.Wallet;
import com.stock.analysis.wallet.WalletBalance;
import com.stock.analysis.wallet.domain.DepositStatus;
import com.stock.analysis.wallet.domain.LedgerType;
import com.stock.analysis.wallet.dto.AdminApprovalRequest;
import com.stock.analysis.wallet.dto.DepositCreateRequest;
import com.stock.analysis.wallet.dto.DepositResponse;
import com.stock.analysis.wallet.dto.PaymentProofResponse;
import com.stock.analysis.wallet.event.DepositApprovedEvent;
import com.stock.analysis.wallet.event.DepositRejectedEvent;
import com.stock.analysis.wallet.event.DepositSubmittedEvent;
import com.stock.analysis.wallet.exception.DuplicateTransactionException;
import com.stock.analysis.wallet.exception.WalletException;
import com.stock.analysis.wallet.repository.DepositRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DepositServiceImpl implements DepositService {

    private final DepositRequestRepository depositRequestRepository;
    private final WalletService walletService;
    private final LedgerService ledgerService;
    private final PaymentProofStorageService paymentProofStorageService;
    private final AuditService auditService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    @Override
    public DepositResponse submitDeposit(User user, DepositCreateRequest request, MultipartFile proofFile) {
        log.info("User {} submitting deposit request for amount {} {}", user.getUsername(), request.getAmount(), request.getCurrency());

        depositRequestRepository.findByTransactionReference(request.getTransactionReference())
                .ifPresent(existing -> {
                    throw new DuplicateTransactionException("Deposit with reference '" + request.getTransactionReference() + "' already exists");
                });

        Wallet wallet = walletService.getOrCreateWallet(user);
        PaymentProof proof = paymentProofStorageService.storeProof(proofFile);

        DepositRequest depositRequest = DepositRequest.builder()
                .wallet(wallet)
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .transactionReference(request.getTransactionReference())
                .status(DepositStatus.PENDING)
                .paymentProof(proof)
                .createdBy(user.getUsername())
                .build();

        depositRequest = depositRequestRepository.save(depositRequest);

        walletService.recordTransactionHistory(wallet, "DEPOSIT", request.getAmount(), "PENDING", BigDecimal.ZERO, "DEPOSIT_REQUEST", depositRequest.getId());
        auditService.logAction(user, "DEPOSIT_CREATED", "DEPOSIT_REQUEST", depositRequest.getId(), "Deposit request created for amount " + request.getAmount(), null);
        eventPublisher.publishEvent(new DepositSubmittedEvent(this, depositRequest));

        return mapToResponse(depositRequest);
    }

    @Transactional
    @Override
    public DepositResponse approveDeposit(UUID depositId, AdminApprovalRequest request, User admin) {
        log.info("Admin {} approving deposit ID: {}", admin.getUsername(), depositId);

        DepositRequest depositRequest = depositRequestRepository.findById(depositId)
                .orElseThrow(() -> new WalletException("Deposit request not found: " + depositId));

        if (depositRequest.getStatus() != DepositStatus.PENDING) {
            throw new WalletException("Only PENDING deposit requests can be approved. Current status: " + depositRequest.getStatus());
        }

        depositRequest.setStatus(DepositStatus.APPROVED);
        depositRequest.setAdminNotes(request != null ? request.getAdminNotes() : null);
        depositRequest = depositRequestRepository.save(depositRequest);

        Wallet wallet = depositRequest.getWallet();

        // Financial Ledger & Balance Update
        WalletBalance balance = walletService.creditAvailableBalance(wallet, depositRequest.getAmount());
        ledgerService.recordEntry(wallet, depositRequest.getAmount(), LedgerType.CREDIT, balance.getAvailableBalance(), "Deposit Approved: Ref " + depositRequest.getTransactionReference(), depositRequest.getId());
        walletService.recordTransactionHistory(wallet, "DEPOSIT", depositRequest.getAmount(), "COMPLETED", BigDecimal.ZERO, "DEPOSIT_REQUEST", depositRequest.getId());

        auditService.logAction(admin, "DEPOSIT_APPROVED", "DEPOSIT_REQUEST", depositRequest.getId(), "Deposit approved by admin: " + admin.getUsername(), null);
        eventPublisher.publishEvent(new DepositApprovedEvent(this, depositRequest));

        return mapToResponse(depositRequest);
    }

    @Transactional
    @Override
    public DepositResponse rejectDeposit(UUID depositId, AdminApprovalRequest request, User admin) {
        log.info("Admin {} rejecting deposit ID: {}", admin.getUsername(), depositId);

        DepositRequest depositRequest = depositRequestRepository.findById(depositId)
                .orElseThrow(() -> new WalletException("Deposit request not found: " + depositId));

        if (depositRequest.getStatus() != DepositStatus.PENDING) {
            throw new WalletException("Only PENDING deposit requests can be rejected. Current status: " + depositRequest.getStatus());
        }

        depositRequest.setStatus(DepositStatus.REJECTED);
        if (request != null) {
            depositRequest.setRejectionReason(request.getRejectionReason());
            depositRequest.setAdminNotes(request.getAdminNotes());
        }
        depositRequest = depositRequestRepository.save(depositRequest);

        walletService.recordTransactionHistory(depositRequest.getWallet(), "DEPOSIT", depositRequest.getAmount(), "FAILED", BigDecimal.ZERO, "DEPOSIT_REQUEST", depositRequest.getId());
        auditService.logAction(admin, "DEPOSIT_REJECTED", "DEPOSIT_REQUEST", depositRequest.getId(), "Deposit rejected by admin: " + admin.getUsername(), null);
        eventPublisher.publishEvent(new DepositRejectedEvent(this, depositRequest));

        return mapToResponse(depositRequest);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<DepositResponse> getPendingDeposits(Pageable pageable) {
        return depositRequestRepository.findByStatus(DepositStatus.PENDING, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<DepositResponse> getUserDeposits(User user, Pageable pageable) {
        return depositRequestRepository.findByWalletUserId(user.getId(), pageable).map(this::mapToResponse);
    }

    private DepositResponse mapToResponse(DepositRequest req) {
        PaymentProofResponse proofResp = null;
        if (req.getPaymentProof() != null) {
            PaymentProof proof = req.getPaymentProof();
            proofResp = PaymentProofResponse.builder()
                    .id(proof.getId())
                    .fileUrl(proof.getFileUrl())
                    .fileType(proof.getFileType())
                    .fileSize(proof.getFileSize())
                    .originalFilename(proof.getOriginalFilename())
                    .build();
        }

        return DepositResponse.builder()
                .id(req.getId())
                .walletId(req.getWallet().getId())
                .amount(req.getAmount())
                .currency(req.getCurrency())
                .transactionReference(req.getTransactionReference())
                .status(req.getStatus())
                .paymentProof(proofResp)
                .rejectionReason(req.getRejectionReason())
                .adminNotes(req.getAdminNotes())
                .createdAt(req.getCreatedAt())
                .build();
    }
}
