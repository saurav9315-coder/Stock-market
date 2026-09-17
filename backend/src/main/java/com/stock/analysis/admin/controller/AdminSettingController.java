package com.stock.analysis.admin.controller;

import com.stock.analysis.admin.audit.AdminAudited;
import com.stock.analysis.admin.dto.SystemSettingDto;
import com.stock.analysis.admin.service.SystemSettingService;
import com.stock.analysis.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminSettingController {

    private final SystemSettingService settingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SystemSettingDto>>> getAllSettings(@RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(settingService.getSettingsByCategory(category)));
        }
        return ResponseEntity.ok(ApiResponse.success(settingService.getAllSettings()));
    }

    @GetMapping("/{key}")
    public ResponseEntity<ApiResponse<SystemSettingDto>> getSettingByKey(@PathVariable String key) {
        return ResponseEntity.ok(ApiResponse.success(settingService.getSettingByKey(key)));
    }

    @PutMapping("/{key}")
    @AdminAudited(action = "UPDATE_SYSTEM_SETTING", resourceName = "SYSTEM_SETTING")
    public ResponseEntity<ApiResponse<SystemSettingDto>> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> body) {
        String value = body.get("value");
        SystemSettingDto updated = settingService.updateSetting(key, value);
        return ResponseEntity.ok(ApiResponse.success("System setting updated successfully", updated));
    }
}
