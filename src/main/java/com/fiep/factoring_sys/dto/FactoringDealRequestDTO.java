package com.fiep.factoring_sys.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class FactoringDealRequestDTO {

    private UUID invoiceId;

    private UUID pricingRuleId;

    private String pricingRuleName;

    private BigDecimal advanceRatePercent;

    private BigDecimal feeRatePercent;

    private String status;

    public FactoringDealRequestDTO() {
    }

    public UUID getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(UUID invoiceId) {
        this.invoiceId = invoiceId;
    }

    public UUID getPricingRuleId() {
        return pricingRuleId;
    }

    public void setPricingRuleId(UUID pricingRuleId) {
        this.pricingRuleId = pricingRuleId;
    }

    public String getPricingRuleName() {
        return pricingRuleName;
    }

    public void setPricingRuleName(String pricingRuleName) {
        this.pricingRuleName = pricingRuleName;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
