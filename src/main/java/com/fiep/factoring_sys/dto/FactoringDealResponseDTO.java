package com.fiep.factoring_sys.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class FactoringDealResponseDTO {

    private UUID id;

    private UUID invoiceId;

    private String invoiceNumber;

    private UUID pricingRuleId;

    private String pricingRuleName;

    private BigDecimal invoiceAmount;

    private BigDecimal financedAmount;

    private BigDecimal fee;

    private BigDecimal advanceRatePercent;

    private BigDecimal feeRatePercent;

    private BigDecimal netDisbursement;

    private String status;

    public FactoringDealResponseDTO() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(UUID invoiceId) {
        this.invoiceId = invoiceId;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
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
        return netDisbursement;
    }

    public void setNetDisbursement(BigDecimal netDisbursement) {
        this.netDisbursement = netDisbursement;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}