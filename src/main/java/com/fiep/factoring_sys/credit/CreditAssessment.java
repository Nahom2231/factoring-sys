package com.fiep.factoring_sys.credit;

import com.fiep.factoring_sys.company.Company;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

@Entity
@Table(name = "credit_assessments")
public class CreditAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @NotNull(message = "Score is required")
    @Positive(message = "Score must be positive")
    private Integer score;

    @Enumerated(EnumType.STRING)
    private CreditDecision decision;

    @NotBlank(message = "Remarks are required")
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    public CreditAssessment() {
    }
    
    public Integer getScore() {
    return score;
      }

    public void setScore(Integer score) {
    this.score = score;
     }
     
     public String getRemarks() {
    return remarks;
}

     public void setRemarks(String remarks) {
      this.remarks = remarks;
     }
    
    public CreditDecision getDecision() {
    return decision;
}

    public void setDecision(CreditDecision decision) {
    this.decision = decision;
   }

   public Company getCompany() {
    return company;
}

   public void setCompany(Company company) {
    this.company = company;
   }

   public UUID getId() {
    return id;
}

  public void setId(UUID id) {
    this.id = id;
   }
}