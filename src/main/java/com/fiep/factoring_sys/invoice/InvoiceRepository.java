package com.fiep.factoring_sys.invoice;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.UUID;

public interface InvoiceRepository
        extends JpaRepository<Invoice, UUID> {

    long countByVerificationStatusIn(
            Collection<InvoiceVerificationStatus> verificationStatuses);
}