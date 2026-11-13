package com.fiep.factoring_sys.credit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface CreditAssessmentRepository
        extends JpaRepository<CreditAssessment, UUID> {

    @Modifying
    @Query("DELETE FROM CreditAssessment ca WHERE ca.id = :id")
    void deleteByAssessmentId(@Param("id") UUID id);
}