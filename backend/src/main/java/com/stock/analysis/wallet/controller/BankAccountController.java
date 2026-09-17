package com.stock.analysis.wallet.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.dto.BankAccountCreateRequest;
import com.stock.analysis.wallet.dto.BankAccountResponse;
import com.stock.analysis.wallet.service.BankAccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/wallet/bank-accounts")
@RequiredArgsConstructor
@Tag(name = "Bank Account Management", description = "Endpoints for managing multi-currency bank accounts for withdrawals")
public class BankAccountController {

    private final BankAccountService bankAccountService;

    @PostMapping
    @Operation(summary = "Add Bank Account", description = "Registers a new bank account with IFSC/SWIFT code and country details")
    public ResponseEntity<ApiResponse<BankAccountResponse>> addBankAccount(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BankAccountCreateRequest request) {

        BankAccountResponse response = bankAccountService.addBankAccount(user, request);
        return ResponseEntity.ok(ApiResponse.success("Bank account added successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get User Bank Accounts", description = "Retrieves all bank accounts belonging to the current user")
    public ResponseEntity<ApiResponse<List<BankAccountResponse>>> getUserBankAccounts(@AuthenticationPrincipal User user) {
        List<BankAccountResponse> list = bankAccountService.getUserBankAccounts(user);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Bank Account", description = "Removes a bank account by ID")
    public ResponseEntity<ApiResponse<Void>> deleteBankAccount(
            @AuthenticationPrincipal User user,
            @PathVariable("id") UUID id) {

        bankAccountService.deleteBankAccount(user, id);
        return ResponseEntity.ok(ApiResponse.success("Bank account deleted successfully", null));
    }
}
