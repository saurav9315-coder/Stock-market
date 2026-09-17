package com.stock.analysis.wallet.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.common.PageResponse;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.dto.TransactionHistoryResponse;
import com.stock.analysis.wallet.dto.WalletLedgerResponse;
import com.stock.analysis.wallet.dto.WalletResponse;
import com.stock.analysis.wallet.service.LedgerService;
import com.stock.analysis.wallet.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
@Tag(name = "Wallet & Financial Engine", description = "Endpoints for user wallet balances, double-entry ledger, and transaction history")
public class WalletController {

    private final WalletService walletService;
    private final LedgerService ledgerService;

    @GetMapping
    @Operation(summary = "Get User Wallet Details", description = "Fetches wallet available, locked, and total balances")
    public ResponseEntity<ApiResponse<WalletResponse>> getWallet(@AuthenticationPrincipal User user) {
        WalletResponse walletResponse = walletService.getWalletDetails(user);
        return ResponseEntity.ok(ApiResponse.success(walletResponse));
    }

    @GetMapping("/history")
    @Operation(summary = "Get Transaction History", description = "Retrieves paginated transaction history with type, status, and date range filtering")
    public ResponseEntity<ApiResponse<PageResponse<TransactionHistoryResponse>>> getTransactionHistory(
            @AuthenticationPrincipal User user,
            @RequestParam(name = "type", required = false) String type,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TransactionHistoryResponse> historyPage = walletService.getTransactionHistory(user, type, status, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(historyPage)));
    }

    @GetMapping("/ledger")
    @Operation(summary = "Get Double-Entry Ledger", description = "Retrieves paginated immutable double-entry ledger entries for the user")
    public ResponseEntity<ApiResponse<PageResponse<WalletLedgerResponse>>> getLedger(
            @AuthenticationPrincipal User user,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<WalletLedgerResponse> ledgerPage = ledgerService.getLedgerForUser(user, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(ledgerPage)));
    }
}
