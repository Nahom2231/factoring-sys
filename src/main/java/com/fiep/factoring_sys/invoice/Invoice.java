package com.fiep.factoring_sys.invoice;

import com.fiep.factoring_sys.company.Company;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Invoice number is required")
    private String invoiceNumber;

    @ManyToOne
    @JoinColumn(name = "carrier_id")
    private Company carrier;

    @Column(name = "carrier_name")
    private String carrierName;

    @ManyToOne
    @JoinColumn(name = "shipper_id")
    private Company shipper;

    @Column(name = "shipper_name")
    private String shipperName;

    @Column(name = "buyer_name")
    private String buyerName;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Issue date is required")
    @Column(name = "issue_date")
    private LocalDate issueDate;

    @NotNull(message = "Due date is required")
    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    @Enumerated(EnumType.STRING)
    private InvoiceVerificationStatus verificationStatus =
            InvoiceVerificationStatus.NOT_CHECKED;

    @Column(length = 2000)
    private String verificationMessage;

    private LocalDateTime verificationCheckedAt;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    private String documentPath;

    public Invoice() {
    }

    @PrePersist
    @PreUpdate
    public void syncLegacyAndNewFields() {
        if (carrier != null && company == null) {
            company = carrier;
        } else if (company != null && carrier == null) {
            carrier = company;
        }
        if ((carrierName == null || carrierName.isBlank()) && carrier != null) {
            carrierName = carrier.getTradeName() != null && !carrier.getTradeName().isBlank()
                    ? carrier.getTradeName()
                    : carrier.getCompanyName();
        }
        if (shipperName == null || shipperName.isBlank()) {
            if (buyerName != null && !buyerName.isBlank()) {
                shipperName = buyerName;
            } else if (shipper != null) {
                shipperName = shipper.getTradeName() != null && !shipper.getTradeName().isBlank()
                        ? shipper.getTradeName()
                        : shipper.getCompanyName();
            }
        }
        if (buyerName == null || buyerName.isBlank()) {
            buyerName = shipperName;
        }
        if (issueDate == null) {
            issueDate = dueDate != null ? dueDate : LocalDate.now();
        }
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

    public Company getCarrier() {
        return carrier != null ? carrier : company;
    }

    public void setCarrier(Company carrier) {
        this.carrier = carrier;
        this.company = carrier;
        if (carrier != null && (this.carrierName == null || this.carrierName.isBlank())) {
            this.carrierName = carrier.getTradeName() != null && !carrier.getTradeName().isBlank()
                    ? carrier.getTradeName()
                    : carrier.getCompanyName();
        }
    }

    public String getCarrierName() {
        if (carrierName != null && !carrierName.isBlank()) {
            return carrierName;
        }
        Company c = getCarrier();
        if (c != null) {
            return c.getTradeName() != null && !c.getTradeName().isBlank()
                    ? c.getTradeName()
                    : c.getCompanyName();
        }
        return null;
    }

    public void setCarrierName(String carrierName) {
        this.carrierName = carrierName;
    }

    public Company getShipper() {
        return shipper;
    }

    public void setShipper(Company shipper) {
        this.shipper = shipper;
        if (shipper != null && (this.shipperName == null || this.shipperName.isBlank())) {
            this.shipperName = shipper.getTradeName() != null && !shipper.getTradeName().isBlank()
                    ? shipper.getTradeName()
                    : shipper.getCompanyName();
            if (this.buyerName == null || this.buyerName.isBlank()) {
                this.buyerName = this.shipperName;
            }
        }
    }

    public String getShipperName() {
        if (shipperName != null && !shipperName.isBlank()) {
            return shipperName;
        }
        if (buyerName != null && !buyerName.isBlank()) {
            return buyerName;
        }
        if (shipper != null) {
            return shipper.getTradeName() != null && !shipper.getTradeName().isBlank()
                    ? shipper.getTradeName()
                    : shipper.getCompanyName();
        }
        return null;
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

    public InvoiceStatus getStatus() {
        return status;
    }

    public void setStatus(InvoiceStatus status) {
        this.status = status;
    }

    public InvoiceVerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(
            InvoiceVerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getVerificationMessage() {
        return verificationMessage;
    }

    public void setVerificationMessage(String verificationMessage) {
        this.verificationMessage = verificationMessage;
    }

    public LocalDateTime getVerificationCheckedAt() {
        return verificationCheckedAt;
    }

    public void setVerificationCheckedAt(
            LocalDateTime verificationCheckedAt) {
        this.verificationCheckedAt = verificationCheckedAt;
    }

    public Company getCompany() {
        return getCarrier();
    }

    public void setCompany(Company company) {
        setCarrier(company);
    }

    public String getDocumentPath() {
        return documentPath;
    }

    public void setDocumentPath(String documentPath) {
        this.documentPath = documentPath;
    }
}