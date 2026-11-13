package com.fiep.factoring_sys.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class InvoiceRequestDTO {

    @NotBlank(message = "Invoice number is required")
    private String invoiceNumber;

    private UUID carrierId;

    private String carrierName;

    private UUID shipperId;

    @NotBlank(message = "Shipper name is required")
    private String shipperName;

    private String buyerName;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private UUID companyId;

    public InvoiceRequestDTO() {
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public UUID getCarrierId() {
        return carrierId != null ? carrierId : companyId;
    }

    public void setCarrierId(UUID carrierId) {
        this.carrierId = carrierId;
    }

    public String getCarrierName() {
        return carrierName;
    }

    public void setCarrierName(String carrierName) {
        this.carrierName = carrierName;
    }

    public UUID getShipperId() {
        return shipperId;
    }

    public void setShipperId(UUID shipperId) {
        this.shipperId = shipperId;
    }

    public String getShipperName() {
        return shipperName != null && !shipperName.isBlank() ? shipperName : buyerName;
    }

    public void setShipperName(String shipperName) {
        this.shipperName = shipperName;
        if (this.buyerName == null || this.buyerName.isBlank()) {
            this.buyerName = shipperName;
        }
    }

    public String getBuyerName() {
        return getShipperName();
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
        if (this.shipperName == null || this.shipperName.isBlank()) {
            this.shipperName = buyerName;
        }
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getIssueDate() {
        return issueDate != null ? issueDate : dueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
        if (this.issueDate == null) {
            this.issueDate = dueDate;
        }
    }

    public UUID getCompanyId() {
        return getCarrierId();
    }

    public void setCompanyId(UUID companyId) {
        this.companyId = companyId;
        if (this.carrierId == null) {
            this.carrierId = companyId;
        }
    }
}