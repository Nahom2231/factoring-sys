package com.fiep.factoring_sys.factoring;

import com.fiep.factoring_sys.invoice.Invoice;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

@Entity
@Table(name = "factoring_deals")
public class FactoringDeal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private BigDecimal invoiceAmount;

    @Column(nullable = false)
    private BigDecimal financedAmount;

    @Column(nullable = false)
    private BigDecimal fee;

    @NotNull(message = "Advance rate is required")
    @DecimalMin(value = "0.00", inclusive = false, message = "Advance rate must be greater than zero")
    @DecimalMax(value = "100.00", message = "Advance rate cannot exceed 100 percent")
    private BigDecimal advanceRatePercent;

    @NotNull(message = "Fee rate is required")
    @DecimalMin(value = "0.00", inclusive = false, message = "Fee rate must be greater than zero")
    @DecimalMax(value = "100.00", message = "Fee rate cannot exceed 100 percent")
    private BigDecimal feeRatePercent;

    @Enumerated(EnumType.STRING)
    private FactoringStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pricing_rule_id")
    private com.fiep.factoring_sys.pricing.PricingRule pricingRule;

    @Column(name = "pricing_rule_name")
    private String pricingRuleName;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    public com.fiep.factoring_sys.pricing.PricingRule getPricingRule() {
        return pricingRule;
    }

    public void setPricingRule(com.fiep.factoring_sys.pricing.PricingRule pricingRule) {
        this.pricingRule = pricingRule;
        if (pricingRule != null && (this.pricingRuleName == null || this.pricingRuleName.isBlank())) {
            this.pricingRuleName = pricingRule.getName();
        }
    }

    public String getPricingRuleName() {
        if (pricingRuleName != null && !pricingRuleName.isBlank()) {
            return pricingRuleName;
        }
        return pricingRule != null ? pricingRule.getName() : "Custom";
    }

    public void setPricingRuleName(String pricingRuleName) {
        this.pricingRuleName = pricingRuleName;
    }

   public BigDecimal getInvoiceAmount() {
    return invoiceAmount;
}

public void setInvoiceAmount(BigDecimal invoiceAmount) {
    this.invoiceAmount = invoiceAmount;
}

public BigDecimal getFinancedAmount() {
    return financedAmount;
}

public void setFinancedAmount(BigDecimal financedAmount) {
    this.financedAmount = financedAmount;
}

public BigDecimal getFee() {
    return fee;
}

public void setFee(BigDecimal fee) {
    this.fee = fee;
}

public BigDecimal getAdvanceRatePercent() {
    return advanceRatePercent;
}

public void setAdvanceRatePercent(BigDecimal advanceRatePercent) {
    this.advanceRatePercent = advanceRatePercent;
}

public BigDecimal getFeeRatePercent() {
    return feeRatePercent;
}

public void setFeeRatePercent(BigDecimal feeRatePercent) {
    this.feeRatePercent = feeRatePercent;
}

public BigDecimal getNetDisbursement() {
    if (financedAmount == null || fee == null) {
        return null;
    }
    return financedAmount.subtract(fee);
}

public FactoringStatus getStatus() {
    return status;
}

public void setStatus(FactoringStatus status) {
    this.status = status;
}

public UUID getId() {
    return id;
}

public void setId(UUID id) {
    this.id = id;
}

public Invoice getInvoice() {
    return invoice;
}

public void setInvoice(Invoice invoice) {
    this.invoice = invoice;
}
}