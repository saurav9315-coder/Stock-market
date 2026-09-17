package com.stock.analysis.notification.repository;

import com.stock.analysis.notification.domain.Notification;
import com.stock.analysis.notification.domain.NotificationCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID>, JpaSpecificationExecutor<Notification> {

    Page<Notification> findByUserIdAndArchivedFalseOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Page<Notification> findByUserIdAndCategoryAndArchivedFalseOrderByCreatedAtDesc(UUID userId, NotificationCategory category, Pageable pageable);

    Page<Notification> findByUserIdAndReadFalseAndArchivedFalseOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<Notification> findByUserIdAndReadFalseAndArchivedFalseOrderByCreatedAtDesc(UUID userId);

    long countByUserIdAndReadFalseAndArchivedFalse(UUID userId);

    Optional<Notification> findByIdAndUserId(UUID id, UUID userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :now WHERE n.user.id = :userId AND n.read = false")
    int markAllAsReadForUser(@Param("userId") UUID userId, @Param("now") Instant now);

    @Modifying
    @Query("UPDATE Notification n SET n.archived = true, n.archivedAt = :now WHERE n.user.id = :userId AND n.archived = false")
    int archiveAllForUser(@Param("userId") UUID userId, @Param("now") Instant now);
}
