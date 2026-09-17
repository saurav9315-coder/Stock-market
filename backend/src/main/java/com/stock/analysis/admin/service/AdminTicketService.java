package com.stock.analysis.admin.service;

// import com.stock.analysis.admin.AdminUser;
import com.stock.analysis.admin.SupportTicket;
import com.stock.analysis.admin.TicketMessage;
import com.stock.analysis.admin.dto.TicketDtos.*;
import com.stock.analysis.admin.repository.SupportTicketRepository;
import com.stock.analysis.admin.repository.TicketMessageRepository;
import com.stock.analysis.exception.ResourceNotFoundException;
import com.stock.analysis.users.User;
import com.stock.analysis.users.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final TicketMessageRepository ticketMessageRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<TicketSummaryDto> getTickets(String status, Pageable pageable) {
        Page<SupportTicket> page;
        if (status != null && !status.isBlank()) {
            page = supportTicketRepository.findByStatus(status, pageable);
        } else {
            page = supportTicketRepository.findAll(pageable);
        }

        return page.map(t -> TicketSummaryDto.builder()
                .id(t.getId())
                .userId(t.getUser().getId())
                .username(t.getUser().getUsername())
                .email(t.getUser().getEmail())
                .subject(t.getSubject())
                .status(t.getStatus())
                .priority(t.getPriority())
                .assignedToUsername(t.getAssignedTo() != null && t.getAssignedTo().getUser() != null ? t.getAssignedTo().getUser().getUsername() : null)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build());
    }

    @Transactional(readOnly = true)
    public TicketDetailDto getTicketDetail(UUID ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        List<TicketMessage> messages = ticketMessageRepository.findBySupportTicketIdOrderByCreatedAtAsc(ticketId);

        List<TicketMessageDto> msgDtos = messages.stream()
                .map(m -> TicketMessageDto.builder()
                        .id(m.getId())
                        .senderUsername(m.getSender().getUsername())
                        .isStaff(m.getSender().getRoles().contains("ADMIN"))
                        .message(m.getMessage())
                        .sentAt(m.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return TicketDetailDto.builder()
                .id(ticket.getId())
                .userId(ticket.getUser().getId())
                .username(ticket.getUser().getUsername())
                .email(ticket.getUser().getEmail())
                .subject(ticket.getSubject())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .assignedToUsername(ticket.getAssignedTo() != null && ticket.getAssignedTo().getUser() != null ? ticket.getAssignedTo().getUser().getUsername() : null)
                .messages(msgDtos)
                .createdAt(ticket.getCreatedAt())
                .build();
    }

    @Transactional
    public void replyTicket(UUID ticketId, ReplyTicketRequest request, UUID adminUserId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        User adminUser = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found: " + adminUserId));

        TicketMessage msg = TicketMessage.builder()
                .supportTicket(ticket)
                .sender(adminUser)
                .message(request.isInternalNote() ? "[INTERNAL NOTE] " + request.getMessage() : request.getMessage())
                .build();

        ticketMessageRepository.save(msg);

        if (!request.isInternalNote() && "OPEN".equals(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
            supportTicketRepository.save(ticket);
        }

        log.info("Admin replied to ticket {}: internalNote={}", ticketId, request.isInternalNote());
    }

    @Transactional
    public void updateTicketStatus(UUID ticketId, String status) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        ticket.setStatus(status.toUpperCase());
        supportTicketRepository.save(ticket);
        log.info("Updated ticket {} status to {}", ticketId, status);
    }
}
