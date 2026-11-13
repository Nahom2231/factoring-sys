package com.fiep.factoring_sys.invoice;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record InvoiceVerificationRequest(
        UUID invoiceId,
        String invoiceNumber,
        String buyerName,
        BigDecimal amount,
        LocalDate dueDate) {
}
