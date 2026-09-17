package com.stock.analysis.wallet.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.common.PageResponse;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.dto.AdminApprovalRequest;
import com.stock.analysis.wallet.dto.DepositResponse;
import com.stock.analysis.wallet.dto.WithdrawalResponse;
import com.stock.analysis.wallet.service.DepositService;
import com.stock.analysis.wallet.service.WithdrawalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/wallet")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Financial Management", description = "Endpoints for admin review and approval/rejection of deposits and withdrawals")
public class AdminWalletController {

    private final DepositService depositService;
    private final WithdrawalService withdrawalService;

    @GetMapping("/deposits")
    @Operation(summary = "Get Pending Deposits", description = "Retrieves paginated list of pending deposit requests for admin review")
    public ResponseEntity<ApiResponse<PageResponse<DepositResponse>>> getPendingDeposits(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        Page<DepositResponse> depositsPage = depositService.getPendingDeposits(pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(depositsPage)));
    }

    @PostMapping("/deposits/{id}/approve")
    @Operation(summary = "Approve Deposit", description = "Approves a pending deposit request and credits user wallet")
    public ResponseEntity<ApiResponse<DepositResponse>> approveDeposit(
            @AuthenticationPrincipal User admin,
            @PathVariable("id") UUID depositId,
            @RequestBody(required = false) AdminApprovalRequest request) {

        DepositResponse response = depositService.approveDeposit(depositId, request, admin);
        return ResponseEntity.ok(ApiResponse.success("Deposit request approved successfully", response));
    }

    @PostMapping("/deposits/{id}/reject")
    @Operation(summary = "Reject Deposit", description = "Rejects a pending deposit request with optional reason")
    public ResponseEntity<ApiResponse<DepositResponse>> rejectDeposit(
            @AuthenticationPrincipal User admin,
            @PathVariable("id") UUID depositId,
            @RequestBody(required = false) AdminApprovalRequest request) {

        DepositResponse response = depositService.rejectDeposit(depositId, request, admin);
        return ResponseEntity.ok(ApiResponse.success("Deposit request rejected successfully", response));
    }

    @GetMapping("/withdrawals")
    @Operation(summary = "Get Pending Withdrawals", description = "Retrieves paginated list of pending withdrawal requests for admin review")
    public ResponseEntity<ApiResponse<PageResponse<WithdrawalResponse>>> getPendingWithdrawals(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        Page<WithdrawalResponse> withdrawalsPage = withdrawalService.getPendingWithdrawals(pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(withdrawalsPage)));
    }

    @PostMapping("/withdrawals/{id}/approve")
    @Operation(summary = "Approve Withdrawal", description = "Approves a pending withdrawal request and completes payout")
    public ResponseEntity<ApiResponse<WithdrawalResponse>> approveWithdrawal(
            @AuthenticationPrincipal User admin,
            @PathVariable("id") UUID withdrawalId,
            @RequestBody(required = false) AdminApprovalRequest request) {

        WithdrawalResponse response = withdrawalService.approveWithdrawal(withdrawalId, request, admin);
        return ResponseEntity.ok(ApiResponse.success("Withdrawal request approved successfully", response));
    }

    @PostMapping("/withdrawals/{id}/reject")
    @Operation(summary = "Reject Withdrawal", description = "Rejects a pending withdrawal request and unlocks locked funds back to user wallet")
    public ResponseEntity<ApiResponse<WithdrawalResponse>> rejectWithdrawal(
            @AuthenticationPrincipal User admin,
            @PathVariable("id") UUID withdrawalId,
            @RequestBody(required = false) AdminApprovalRequest request) {

        WithdrawalResponse response = withdrawalService.rejectWithdrawal(withdrawalId, request, admin);
        return ResponseEntity.ok(ApiResponse.success("Withdrawal request rejected successfully", response));
    }
}
