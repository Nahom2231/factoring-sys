package com.fiep.factoring_sys.dto;

import com.fiep.factoring_sys.credit.CreditDecision;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CreditAssessmentRequestDTO {

    @NotNull
    @Positive
    private Integer score;

    @NotBlank
    private String remarks;

    private CreditDecision decision;

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
}
