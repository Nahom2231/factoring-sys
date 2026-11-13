package com.fiep.factoring_sys.factoring;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface FactoringDealRepository
        extends JpaRepository<FactoringDeal, UUID> {

    long countByStatus(FactoringStatus status);

    @Modifying
    @Query("DELETE FROM FactoringDeal d WHERE d.invoice.id = :invoiceId")
    void deleteByInvoiceId(@Param("invoiceId") UUID invoiceId);

    @Modifying
    @Query("DELETE FROM FactoringDeal d WHERE d.id = :id")
    void deleteByDealId(@Param("id") UUID id);
}