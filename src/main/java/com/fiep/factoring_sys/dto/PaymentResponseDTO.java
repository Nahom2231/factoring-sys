package com.fiep.factoring_sys.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class PaymentResponseDTO {

    private UUID id;

    private BigDecimal amount;

    private LocalDate paymentDate;

    private String status;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}