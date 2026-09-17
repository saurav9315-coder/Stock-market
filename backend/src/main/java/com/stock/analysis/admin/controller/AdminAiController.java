package com.stock.analysis.admin.controller;

import com.stock.analysis.admin.audit.AdminAudited;
import com.stock.analysis.admin.dto.AiOperationsDtos.*;
import com.stock.analysis.admin.service.AdminAiOperationsService;
import com.stock.analysis.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/ai")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminAiController {

    private final AdminAiOperationsService aiOperationsService;

    @GetMapping("/usage")
    public ResponseEntity<ApiResponse<AiUsageStatsDto>> getAiUsageStats() {
        return ResponseEntity.ok(ApiResponse.success(aiOperationsService.getAiUsageStats()));
    }

    @GetMapping("/templates")
    public ResponseEntity<ApiResponse<List<PromptTemplateDto>>> getPromptTemplates() {
        return ResponseEntity.ok(ApiResponse.success(aiOperationsService.getPromptTemplates()));
    }

    @PutMapping("/templates")
    @AdminAudited(action = "UPDATE_AI_PROMPT_TEMPLATE", resourceName = "AI_TEMPLATE")
    public ResponseEntity<ApiResponse<String>> updatePromptTemplate(@RequestBody PromptTemplateRequest request) {
        aiOperationsService.updatePromptTemplate(request);
        return ResponseEntity.ok(ApiResponse.success("AI Prompt Template updated successfully", "OK"));
    }

    @GetMapping("/provider-health")
    public ResponseEntity<ApiResponse<List<AiProviderHealthDto>>> getProviderHealth() {
        return ResponseEntity.ok(ApiResponse.success(aiOperationsService.getProviderHealth()));
    }
}
