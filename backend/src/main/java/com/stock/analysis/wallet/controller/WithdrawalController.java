package com.stock.analysis.wallet.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.common.PageResponse;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.dto.WithdrawalCreateRequest;
import com.stock.analysis.wallet.dto.WithdrawalResponse;
import com.stock.analysis.wallet.service.WithdrawalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/wallet/withdraw")
@RequiredArgsConstructor
@Tag(name = "Withdrawal Management", description = "Endpoints for placing withdrawal requests after KYC and bank validation")
public class WithdrawalController {

    private final WithdrawalService withdrawalService;

    @PostMapping
    @Operation(summary = "Submit Withdrawal Request", description = "Submits a withdrawal request after verifying user balance, KYC status, and bank account")
    public ResponseEntity<ApiResponse<WithdrawalResponse>> submitWithdrawal(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody WithdrawalCreateRequest request) {

        WithdrawalResponse response = withdrawalService.submitWithdrawal(user, request);
        return ResponseEntity.ok(ApiResponse.success("Withdrawal request submitted successfully and is pending admin approval", response));
    }

    @GetMapping
    @Operation(summary = "Get User Withdrawals", description = "Retrieves paginated withdrawal requests for the current user")
    public ResponseEntity<ApiResponse<PageResponse<WithdrawalResponse>>> getUserWithdrawals(
            @AuthenticationPrincipal User user,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<WithdrawalResponse> withdrawalsPage = withdrawalService.getUserWithdrawals(user, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(withdrawalsPage)));
    }
}
