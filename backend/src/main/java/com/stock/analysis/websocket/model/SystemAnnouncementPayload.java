package com.stock.analysis.websocket.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemAnnouncementPayload {

    private String announcementId;
    private String title;
    private String content;
    private String announcementType; // BROADCAST, MAINTENANCE, EMERGENCY
    private Instant scheduledStartTime;
    private Instant scheduledEndTime;
    private Instant createdAt;
}
