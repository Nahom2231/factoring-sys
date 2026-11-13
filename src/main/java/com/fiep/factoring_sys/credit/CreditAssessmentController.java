package com.fiep.factoring_sys.credit;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/api/credit-assessments")
public class CreditAssessmentController {

    private final CreditAssessmentService service;

    public CreditAssessmentController(
            CreditAssessmentService service) {

        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CREDIT_ANALYST') or hasRole('FACTORING_OFFICER') or hasRole('FINANCE_OFFICER')")
    public CreditAssessment createAssessment(
         @Valid @RequestBody CreditAssessment assessment) {

        return service.createAssessment(assessment);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<CreditAssessment> getAllAssessments() {

        return service.getAllAssessments();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CREDIT_ANALYST') or hasRole('FACTORING_OFFICER') or hasRole('FINANCE_OFFICER')")
    public CreditAssessment updateAssessment(
        @PathVariable UUID id,
        @Valid @RequestBody CreditAssessment assessment) {

    return service.updateAssessment(id, assessment);
}

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CREDIT_ANALYST') or hasRole('FACTORING_OFFICER') or hasRole('FINANCE_OFFICER')")
    public void deleteAssessment(
        @PathVariable UUID id) {

    service.deleteAssessment(id);
  }
}