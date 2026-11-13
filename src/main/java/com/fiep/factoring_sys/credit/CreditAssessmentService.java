package com.fiep.factoring_sys.credit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fiep.factoring_sys.exception.ResourceNotFoundException;
import java.util.UUID;
import java.util.List;

@Service
public class CreditAssessmentService {

    private final CreditAssessmentRepository repository;

    public CreditAssessmentService(
            CreditAssessmentRepository repository) {

        this.repository = repository;
    }

    public CreditAssessment createAssessment(
            CreditAssessment assessment) {

        return repository.save(assessment);
    }

    public List<CreditAssessment> getAllAssessments() {

        return repository.findAll();
    }

    public CreditAssessment updateAssessment(
        UUID id,
        CreditAssessment updatedAssessment) {

    CreditAssessment assessment =
            repository.findById(id)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Assessment not found"));

    assessment.setScore(
            updatedAssessment.getScore());

    assessment.setRemarks(
            updatedAssessment.getRemarks());

    assessment.setDecision(
            updatedAssessment.getDecision());

    assessment.setCompany(
            updatedAssessment.getCompany());

    return repository.save(assessment);
}

    @Transactional
    public void deleteAssessment(UUID id) {
        if (id != null) {
            repository.deleteByAssessmentId(id);
        }
    }
}