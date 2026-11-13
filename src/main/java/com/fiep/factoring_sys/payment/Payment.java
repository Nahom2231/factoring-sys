package com.fiep.factoring_sys.payment;

import com.fiep.factoring_sys.factoring.FactoringDeal;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "factoring_deal_id")
    private FactoringDeal factoringDeal;
    
    private String receiptPath;

    public Payment() {
    }

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

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public FactoringDeal getFactoringDeal() {
        return factoringDeal;
    }

    public void setFactoringDeal(FactoringDeal factoringDeal) {
        this.factoringDeal = factoringDeal;
    }

    public String getReceiptPath() {
    return receiptPath;
}

    public void setReceiptPath(String receiptPath) {
    this.receiptPath = receiptPath;
   }

   
}