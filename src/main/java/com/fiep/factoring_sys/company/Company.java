package com.fiep.factoring_sys.company;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "fiep_number")
    private String fiepNumber;

    @Column(name = "legal_name")
    private String legalName;

    @Column(name = "trade_name")
    private String tradeName;

    @Column(name = "kind")
    private String kind;

    @Email(message = "Email must be a valid email address")
    @Column(name = "email")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Column(name = "phone")
    private String phone;

    @Column(name = "address_line1")
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "country")
    private String country;

    @Column(name = "tin")
    private String tin;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "address")
    private String address;

    public Company() {
    }

    @PrePersist
    @PreUpdate
    public void syncLegacyFields() {
        if ((companyName == null || companyName.isBlank())) {
            if (tradeName != null && !tradeName.isBlank()) {
                companyName = tradeName;
            } else if (legalName != null && !legalName.isBlank()) {
                companyName = legalName;
            }
        }
        if ((tradeName == null || tradeName.isBlank()) && companyName != null && !companyName.isBlank()) {
            tradeName = companyName;
        }
        if ((legalName == null || legalName.isBlank()) && companyName != null && !companyName.isBlank()) {
            legalName = companyName;
        }

        if (address == null || address.isBlank()) {
            StringBuilder sb = new StringBuilder();
            if (addressLine1 != null && !addressLine1.isBlank()) {
                sb.append(addressLine1.trim());
            }
            if (addressLine2 != null && !addressLine2.isBlank()) {
                if (!sb.isEmpty()) sb.append(", ");
                sb.append(addressLine2.trim());
            }
            if (city != null && !city.isBlank()) {
                if (!sb.isEmpty()) sb.append(", ");
                sb.append(city.trim());
            }
            if (state != null && !state.isBlank()) {
                if (!sb.isEmpty()) sb.append(", ");
                sb.append(state.trim());
            }
            if (country != null && !country.isBlank()) {
                if (!sb.isEmpty()) sb.append(", ");
                sb.append(country.trim());
            }
            if (!sb.isEmpty()) {
                address = sb.toString();
            }
        } else if (addressLine1 == null || addressLine1.isBlank()) {
            addressLine1 = address;
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getFiepNumber() {
        return fiepNumber;
    }

    public void setFiepNumber(String fiepNumber) {
        this.fiepNumber = fiepNumber;
    }

    public String getLegalName() {
        return legalName;
    }

    public void setLegalName(String legalName) {
        this.legalName = legalName;
        if (this.companyName == null || this.companyName.isBlank()) {
            this.companyName = legalName;
        }
    }

    public String getTradeName() {
        return tradeName;
    }

    public void setTradeName(String tradeName) {
        this.tradeName = tradeName;
        if (this.companyName == null || this.companyName.isBlank()) {
            this.companyName = tradeName;
        }
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getTin() {
        return tin;
    }

    public void setTin(String tin) {
        this.tin = tin;
    }

    public String getCompanyName() {
        if (companyName != null && !companyName.isBlank()) {
            return companyName;
        }
        if (tradeName != null && !tradeName.isBlank()) {
            return tradeName;
        }
        return legalName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
        if (this.tradeName == null || this.tradeName.isBlank()) {
            this.tradeName = companyName;
        }
        if (this.legalName == null || this.legalName.isBlank()) {
            this.legalName = companyName;
        }
    }

    public String getAddress() {
        if (address != null && !address.isBlank()) {
            return address;
        }
        StringBuilder sb = new StringBuilder();
        if (addressLine1 != null && !addressLine1.isBlank()) sb.append(addressLine1.trim());
        if (addressLine2 != null && !addressLine2.isBlank()) {
            if (!sb.isEmpty()) sb.append(", ");
            sb.append(addressLine2.trim());
        }
        if (city != null && !city.isBlank()) {
            if (!sb.isEmpty()) sb.append(", ");
            sb.append(city.trim());
        }
        if (state != null && !state.isBlank()) {
            if (!sb.isEmpty()) sb.append(", ");
            sb.append(state.trim());
        }
        if (country != null && !country.isBlank()) {
            if (!sb.isEmpty()) sb.append(", ");
            sb.append(country.trim());
        }
        return !sb.isEmpty() ? sb.toString() : addressLine1;
    }

    public void setAddress(String address) {
        this.address = address;
        if (this.addressLine1 == null || this.addressLine1.isBlank()) {
            this.addressLine1 = address;
        }
    }
}