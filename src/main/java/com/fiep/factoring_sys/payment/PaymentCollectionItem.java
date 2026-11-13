package com.fiep.factoring_sys.payment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentCollectionItem(
        UUID id,
        UUID factoringDealId,
        String invoiceNumber,
        String shipperName,
        String buyerName,
        BigDecimal amount,
        BigDecimal receivedForDeal,
        BigDecimal financedAmount,
        BigDecimal remainingBalance,
        LocalDate expectedDate,
        LocalDate receivedDate,
        long daysLate,
        PaymentStatus status,
        boolean receiptUploaded) {
}
