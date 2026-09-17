package com.stock.analysis.admin.controller;

import com.stock.analysis.admin.audit.AdminAudited;
import com.stock.analysis.admin.dto.KycManagementDtos.*;
import com.stock.analysis.admin.service.AdminKycManagementService;
import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.common.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/kyc")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminKycController {

    private final AdminKycManagementService kycService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<KycSummaryDto>>> getKycRequests(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<KycSummaryDto> result = kycService.getKycRequests(status, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<KycDetailDto>> getKycDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(kycService.getKycDetail(id)));
    }

    @PostMapping("/{id}/action")
    @AdminAudited(action = "PROCESS_KYC_ACTION", resourceName = "KYC")
    public ResponseEntity<ApiResponse<String>> processKycAction(
            @PathVariable UUID id,
            @RequestBody KycActionRequest request) {
        kycService.processKycAction(id, request);
        return ResponseEntity.ok(ApiResponse.success("KYC action processed successfully", "OK"));
    }
}
