package com.fiep.factoring_sys.invoice;

import org.springframework.http.HttpStatus;

public class InvoiceVerificationException extends RuntimeException {

    private final HttpStatus status;

    public InvoiceVerificationException(
            HttpStatus status,
            String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
