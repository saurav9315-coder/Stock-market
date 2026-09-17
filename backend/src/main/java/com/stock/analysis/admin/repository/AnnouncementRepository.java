package com.stock.analysis.admin.repository;

import com.stock.analysis.admin.domain.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {

    Page<Announcement> findByStatus(String status, Pageable pageable);

    List<Announcement> findByStatusAndScheduledAtBefore(String status, Instant now);

    @Query("SELECT a FROM Announcement a WHERE a.status = 'BROADCASTED' ORDER BY a.broadcastAt DESC")
    List<Announcement> findRecentBroadcasts(Pageable pageable);
}
