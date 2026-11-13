package com.fiep.factoring_sys.company;

import com.fiep.factoring_sys.audit.AuditLogService;
import com.fiep.factoring_sys.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final AuditLogService auditLogService;

    public CompanyService(
            CompanyRepository companyRepository,
            AuditLogService auditLogService) {

        this.companyRepository = companyRepository;
        this.auditLogService = auditLogService;
    }

    public Company createCompany(Company request) {
        request.syncLegacyFields();
        Company savedCompany = companyRepository.save(request);

        auditLogService.log(
                auditLogService.getCurrentUser(),
                "CREATE COMPANY");

        return savedCompany;
    }

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    public List<CompanyOption> getCompanyOptions() {
        return companyRepository.findAllCompanyOptions();
    }

    public Company getCompanyById(UUID id) {
        return companyRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Company not found"));
    }

    public Company updateCompany(UUID id, Company updatedCompany) {
        Company company = companyRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Company not found"));

        company.setFiepNumber(updatedCompany.getFiepNumber());
        company.setLegalName(updatedCompany.getLegalName());
        company.setTradeName(updatedCompany.getTradeName());
        company.setKind(updatedCompany.getKind());
        company.setEmail(updatedCompany.getEmail());
        company.setPhone(updatedCompany.getPhone());
        company.setAddressLine1(updatedCompany.getAddressLine1());
        company.setAddressLine2(updatedCompany.getAddressLine2());
        company.setCity(updatedCompany.getCity());
        company.setState(updatedCompany.getState());
        company.setCountry(updatedCompany.getCountry());
        company.setTin(updatedCompany.getTin());
        company.setCompanyName(updatedCompany.getCompanyName());
        company.setAddress(updatedCompany.getAddress());
        company.syncLegacyFields();

        Company saved = companyRepository.save(company);

        auditLogService.log(
                auditLogService.getCurrentUser(),
                "UPDATE COMPANY");

        return saved;
    }

    public void deleteCompany(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Company not found"));
        auditLogService.log(
                auditLogService.getCurrentUser(),
                "DELETE COMPANY");
        companyRepository.delete(company);
    }
}