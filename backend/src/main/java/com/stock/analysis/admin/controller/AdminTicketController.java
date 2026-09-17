package com.stock.analysis.admin.controller;

import com.stock.analysis.admin.audit.AdminAudited;
import com.stock.analysis.admin.dto.TicketDtos.*;
import com.stock.analysis.admin.service.AdminTicketService;
import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.common.PageResponse;
import com.stock.analysis.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/tickets")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminTicketController {

    private final AdminTicketService ticketService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TicketSummaryDto>>> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<TicketSummaryDto> result = ticketService.getTickets(status, PageRequest.of(page, size));
        PageResponse<TicketSummaryDto> response = PageResponse.from(result);
        return ResponseEntity.ok(ApiResponse.success("Tickets retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketDetailDto>> getTicketDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.getTicketDetail(id)));
    }

    @PostMapping("/{id}/reply")
    @AdminAudited(action = "REPLY_SUPPORT_TICKET", resourceName = "SUPPORT_TICKET")
    public ResponseEntity<ApiResponse<String>> replyTicket(
            @PathVariable UUID id,
            @RequestBody ReplyTicketRequest request,
            @AuthenticationPrincipal User adminUser) {
        UUID adminId = adminUser != null ? adminUser.getId() : UUID.randomUUID();
        ticketService.replyTicket(id, request, adminId);
        return ResponseEntity.ok(ApiResponse.success("Reply submitted successfully", "OK"));
    }

    @PutMapping("/{id}/status")
    @AdminAudited(action = "UPDATE_TICKET_STATUS", resourceName = "SUPPORT_TICKET")
    public ResponseEntity<ApiResponse<String>> updateTicketStatus(
            @PathVariable UUID id,
            @RequestParam String status) {
        ticketService.updateTicketStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated successfully", "OK"));
    }
}
