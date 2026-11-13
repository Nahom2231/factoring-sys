package com.fiep.factoring_sys.invoice;

public record InvoiceVerificationApiResponse(
        Boolean verified,
        String message) {
}
