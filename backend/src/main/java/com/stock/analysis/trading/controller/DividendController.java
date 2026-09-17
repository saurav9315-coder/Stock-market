package com.stock.analysis.trading.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.common.PageResponse;
import com.stock.analysis.trading.dto.DividendPayoutResponse;
import com.stock.analysis.trading.dto.DividendRequest;
import com.stock.analysis.trading.dto.DividendResponse;
import com.stock.analysis.trading.service.DividendService;
import com.stock.analysis.users.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dividends")
@RequiredArgsConstructor
@Tag(name = "Dividend & Corporate Actions", description = "Endpoints for corporate actions and dividend distribution")
public class DividendController {

    private final DividendService dividendService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Announce Dividend", description = "Admin endpoint to record a corporate dividend announcement")
    public ResponseEntity<ApiResponse<DividendResponse>> announceDividend(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DividendRequest request) {
        DividendResponse response = dividendService.announceDividend(request, user.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Dividend announced successfully", response));
    }

    @PostMapping("/{id}/payout")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Execute Dividend Payouts", description = "Admin endpoint to trigger dividend distribution payouts to shareholders")
    public ResponseEntity<ApiResponse<List<DividendPayoutResponse>>> executePayouts(@PathVariable("id") UUID dividendId) {
        List<DividendPayoutResponse> payouts = dividendService.processDividendPayouts(dividendId);
        return ResponseEntity.ok(ApiResponse.success("Dividend payouts processed successfully", payouts));
    }

    @GetMapping
    @Operation(summary = "Get User Dividend Payouts", description = "Retrieves user's received dividend payouts")
    public ResponseEntity<ApiResponse<PageResponse<DividendPayoutResponse>>> getUserPayouts(
            @AuthenticationPrincipal User user,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("paidAt").descending());
        Page<DividendPayoutResponse> payoutsPage = dividendService.getUserDividendPayouts(user, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(payoutsPage)));
    }
}
