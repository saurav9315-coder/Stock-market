package com.stock.analysis.trading.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.common.PageResponse;
import com.stock.analysis.trading.repository.TransactionHistoryRepository;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.TransactionHistory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "Transaction History", description = "Endpoints for financial transaction history and ledgers")
public class TransactionController {

    private final TransactionHistoryRepository transactionHistoryRepository;

    @GetMapping
    @Operation(summary = "Get Transaction History", description = "Retrieves paginated financial transaction records for the authenticated user")
    public ResponseEntity<ApiResponse<PageResponse<TransactionHistory>>> getTransactions(
            @AuthenticationPrincipal User user,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TransactionHistory> historyPage = transactionHistoryRepository.findByWalletUserId(user.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(historyPage)));
    }
}
