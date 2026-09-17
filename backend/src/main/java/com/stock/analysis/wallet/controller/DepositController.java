package com.stock.analysis.wallet.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.common.PageResponse;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.dto.DepositCreateRequest;
import com.stock.analysis.wallet.dto.DepositResponse;
import com.stock.analysis.wallet.service.DepositService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/wallet/deposit")
@RequiredArgsConstructor
@Tag(name = "Deposit Management", description = "Endpoints for submitting manual deposits with payment proof upload")
public class DepositController {

    private final DepositService depositService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Submit Deposit Request", description = "Submits a manual deposit request with payment proof (Image/PDF)")
    public ResponseEntity<ApiResponse<DepositResponse>> submitDeposit(
            @AuthenticationPrincipal User user,
            @RequestParam("amount") BigDecimal amount,
            @RequestParam(name = "currency", defaultValue = "USD") String currency,
            @RequestParam("transactionReference") String transactionReference,
            @RequestPart("proof") MultipartFile proofFile) {

        DepositCreateRequest request = DepositCreateRequest.builder()
                .amount(amount)
                .currency(currency)
                .transactionReference(transactionReference)
                .build();

        DepositResponse response = depositService.submitDeposit(user, request, proofFile);
        return ResponseEntity.ok(ApiResponse.success("Deposit request submitted successfully and is pending admin approval", response));
    }

    @GetMapping
    @Operation(summary = "Get User Deposits", description = "Retrieves paginated deposit requests for the current user")
    public ResponseEntity<ApiResponse<PageResponse<DepositResponse>>> getUserDeposits(
            @AuthenticationPrincipal User user,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<DepositResponse> depositsPage = depositService.getUserDeposits(user, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(depositsPage)));
    }
}
