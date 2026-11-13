package com.fiep.factoring_sys.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class InvoiceResponseDTO {

    private UUID id;

    private String invoiceNumber;

    private UUID carrierId;

    private String carrierName;

    private UUID shipperId;

    private String shipperName;

    private String buyerName;

    private BigDecimal amount;

    private LocalDate issueDate;

    private LocalDate dueDate;

    private String status;

    private String verificationStatus;

    public InvoiceResponseDTO() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public UUID getCarrierId() {
        return carrierId;
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
        return shipperName;
    }

    public void setShipperName(String shipperName) {
        this.shipperName = shipperName;
        if (this.buyerName == null || this.buyerName.isBlank()) {
            this.buyerName = shipperName;
        }
    }

    public String getBuyerName() {
        return buyerName != null ? buyerName : shipperName;
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
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }
}