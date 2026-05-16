// ── LeadRepository.java ───────────────────────────────────────────────────────
package com.fitlift.repository;

import com.fitlift.model.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {
    boolean existsByPhone(String phone);
    List<Lead> findAllByOrderByScoreValueDesc();
    List<Lead> findByStatusOrderByScoreValueDesc(Lead.LeadStatus status);
    long countByStatus(Lead.LeadStatus status);
}
