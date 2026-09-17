package com.stock.analysis.admin.service;

import com.stock.analysis.admin.domain.Announcement;
import com.stock.analysis.admin.dto.AnnouncementDtos.*;
import com.stock.analysis.admin.repository.AnnouncementRepository;
import com.stock.analysis.exception.ResourceNotFoundException;
import com.stock.analysis.websocket.model.SystemAnnouncementPayload;
import com.stock.analysis.websocket.service.RealtimeEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final RealtimeEventPublisher realtimeEventPublisher;

    @Transactional(readOnly = true)
    public Page<AnnouncementDto> getAnnouncements(String status, Pageable pageable) {
        Page<Announcement> page;
        if (status != null && !status.isBlank()) {
            page = announcementRepository.findByStatus(status, pageable);
        } else {
            page = announcementRepository.findAll(pageable);
        }

        return page.map(this::toDto);
    }

    @Transactional
    public AnnouncementDto createAnnouncement(CreateAnnouncementRequest request) {
        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : "ANNOUNCEMENT")
                .targetAudience(request.getTargetAudience() != null ? request.getTargetAudience() : "ALL")
                .scheduledAt(request.getScheduledAt())
                .broadcastChannel(request.getBroadcastChannel() != null ? request.getBroadcastChannel() : "IN_APP")
                .status(request.getScheduledAt() != null ? "SCHEDULED" : "DRAFT")
                .build();

        Announcement saved = announcementRepository.save(announcement);
        log.info("Admin created announcement: {}", saved.getId());
        return toDto(saved);
    }

    @Transactional
    public void broadcastAnnouncement(UUID id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found: " + id));

        announcement.setStatus("BROADCASTED");
        announcement.setBroadcastAt(Instant.now());
        announcementRepository.save(announcement);

        SystemAnnouncementPayload payload = SystemAnnouncementPayload.builder()
                .announcementId(announcement.getId().toString())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .announcementType(announcement.getType())
                .createdAt(announcement.getCreatedAt())
                .build();

        realtimeEventPublisher.publishAnnouncement(payload);
        log.info("Broadcasted announcement {} to all connected clients", id);
    }

    private AnnouncementDto toDto(Announcement a) {
        return AnnouncementDto.builder()
                .id(a.getId())
                .title(a.getTitle())
                .content(a.getContent())
                .type(a.getType())
                .targetAudience(a.getTargetAudience())
                .scheduledAt(a.getScheduledAt())
                .broadcastAt(a.getBroadcastAt())
                .status(a.getStatus())
                .broadcastChannel(a.getBroadcastChannel())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
