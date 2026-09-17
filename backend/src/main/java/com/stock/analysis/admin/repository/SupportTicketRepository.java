package com.stock.analysis.admin.repository;

import com.stock.analysis.admin.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, UUID>, JpaSpecificationExecutor<SupportTicket> {

    Page<SupportTicket> findByUserId(UUID userId, Pageable pageable);

    Page<SupportTicket> findByStatus(String status, Pageable pageable);

    Page<SupportTicket> findByAssignedToId(UUID adminUserId, Pageable pageable);
}
