package com.stock.analysis.admin.controller;

import com.stock.analysis.admin.audit.AdminAudited;
import com.stock.analysis.admin.dto.AnnouncementDtos.*;
import com.stock.analysis.admin.service.AdminAnnouncementService;
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
@RequestMapping("/api/v1/admin/announcements")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminAnnouncementController {

    private final AdminAnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AnnouncementDto>>> getAnnouncements(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AnnouncementDto> result = announcementService.getAnnouncements(status, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PostMapping
    @AdminAudited(action = "CREATE_ANNOUNCEMENT", resourceName = "ANNOUNCEMENT")
    public ResponseEntity<ApiResponse<AnnouncementDto>> createAnnouncement(@RequestBody CreateAnnouncementRequest request) {
        AnnouncementDto announcement = announcementService.createAnnouncement(request);
        return ResponseEntity.ok(ApiResponse.success("Announcement created successfully", announcement));
    }

    @PostMapping("/{id}/broadcast")
    @AdminAudited(action = "BROADCAST_ANNOUNCEMENT", resourceName = "ANNOUNCEMENT")
    public ResponseEntity<ApiResponse<String>> broadcastAnnouncement(@PathVariable UUID id) {
        announcementService.broadcastAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.success("Announcement broadcasted successfully", "OK"));
    }
}
