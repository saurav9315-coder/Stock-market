package com.stock.analysis.admin.controller;

import com.stock.analysis.admin.audit.AdminAudited;
import com.stock.analysis.admin.dto.FinancialOperationDtos.*;
import com.stock.analysis.admin.service.AdminFinancialOperationsService;
import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.common.PageResponse;
import com.stock.analysis.wallet.domain.DepositStatus;
import com.stock.analysis.wallet.domain.WithdrawalStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminFinancialController {

    private final AdminFinancialOperationsService financialService;

    @GetMapping("/deposits")
    public ResponseEntity<ApiResponse<PageResponse<DepositReviewDto>>> getDeposits(
            @RequestParam(required = false) DepositStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<DepositReviewDto> result = financialService.getDeposits(status, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PostMapping("/deposits/{id}/action")
    @AdminAudited(action = "PROCESS_DEPOSIT", resourceName = "DEPOSIT")
    public ResponseEntity<ApiResponse<String>> processDeposit(
            @PathVariable UUID id,
            @RequestBody DepositActionRequest request) {
        financialService.processDeposit(id, request);
        return ResponseEntity.ok(ApiResponse.success("Deposit action processed successfully", "OK"));
    }

    @GetMapping("/withdrawals")
    public ResponseEntity<ApiResponse<PageResponse<WithdrawalReviewDto>>> getWithdrawals(
            @RequestParam(required = false) WithdrawalStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<WithdrawalReviewDto> result = financialService.getWithdrawals(status, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PostMapping("/withdrawals/{id}/action")
    @AdminAudited(action = "PROCESS_WITHDRAWAL", resourceName = "WITHDRAWAL")
    public ResponseEntity<ApiResponse<String>> processWithdrawal(
            @PathVariable UUID id,
            @RequestBody WithdrawalActionRequest request) {
        financialService.processWithdrawal(id, request);
        return ResponseEntity.ok(ApiResponse.success("Withdrawal action processed successfully", "OK"));
    }
}
