package com.fiep.factoring_sys.pricing;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "pricing_rules")
public class PricingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Pricing rule name is required")
    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String code;

    @NotNull(message = "Advance rate is required")
    @DecimalMin(value = "0.01", message = "Advance rate must be greater than zero")
    @DecimalMax(value = "100.00", message = "Advance rate cannot exceed 100 percent")
    @Column(name = "advance_rate_percent", nullable = false)
    private BigDecimal advanceRatePercent;

    @NotNull(message = "Fee rate is required")
    @DecimalMin(value = "0.01", message = "Fee rate must be greater than zero")
    @DecimalMax(value = "100.00", message = "Fee rate cannot exceed 100 percent")
    @Column(name = "fee_rate_percent", nullable = false)
    private BigDecimal feeRatePercent;

    @Column(length = 500)
    private String description;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(name = "min_amount")
    private BigDecimal minAmount;

    @Column(name = "max_amount")
    private BigDecimal maxAmount;

    public PricingRule() {
    }

    public PricingRule(String name, BigDecimal advanceRatePercent, BigDecimal feeRatePercent) {
        this.name = name;
        this.advanceRatePercent = advanceRatePercent;
        this.feeRatePercent = feeRatePercent;
    }

    public PricingRule(String name, String code, BigDecimal advanceRatePercent, BigDecimal feeRatePercent, String description, Boolean isDefault) {
        this.name = name;
        this.code = code;
        this.advanceRatePercent = advanceRatePercent;
        this.feeRatePercent = feeRatePercent;
        this.description = description;
        this.isDefault = isDefault;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public BigDecimal getAdvanceRatePercent() {
        return advanceRatePercent;
    }

    public void setAdvanceRatePercent(BigDecimal advanceRatePercent) {
        this.advanceRatePercent = advanceRatePercent;
    }

    public BigDecimal getDefaultAdvanceRatePercent() {
        return advanceRatePercent;
    }

    public void setDefaultAdvanceRatePercent(BigDecimal rate) {
        this.advanceRatePercent = rate;
    }

    public BigDecimal getFeeRatePercent() {
        return feeRatePercent;
    }

    public void setFeeRatePercent(BigDecimal feeRatePercent) {
        this.feeRatePercent = feeRatePercent;
    }

    public BigDecimal getDefaultFeeRatePercent() {
        return feeRatePercent;
    }

    public void setDefaultFeeRatePercent(BigDecimal rate) {
        this.feeRatePercent = rate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsDefault() {
        return isDefault != null && isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public BigDecimal getMinAmount() {
        return minAmount;
    }

    public void setMinAmount(BigDecimal minAmount) {
        this.minAmount = minAmount;
    }

    public BigDecimal getMaxAmount() {
        return maxAmount;
    }

    public void setMaxAmount(BigDecimal maxAmount) {
        this.maxAmount = maxAmount;
    }
}
