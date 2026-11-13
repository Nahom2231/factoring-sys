package com.fiep.factoring_sys.company;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import java.util.List;

import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(
            CompanyService companyService) {

        this.companyService = companyService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Company createCompany(
        @Valid @RequestBody Company company) {

        return companyService.createCompany(
                company);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Company> getAllCompanies() {

        return companyService.getAllCompanies();
    }

    @GetMapping("/options")
    @PreAuthorize("hasAnyRole('ADMIN', 'CREDIT_ANALYST', 'FACTORING_OFFICER', 'FINANCE_OFFICER')")
    public List<CompanyOption> getCompanyOptions() {
        return companyService.getCompanyOptions();
    }

    @GetMapping("/{id:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}")
    public Company getCompanyById(
            @PathVariable UUID id) {

        return companyService.getCompanyById(id);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
public Company updateCompany(
        @PathVariable UUID id,
        @RequestBody Company company) {

    return companyService.updateCompany(
            id,
            company);
}
    @DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public void deleteCompany(
            @PathVariable UUID id) {

        companyService.deleteCompany(id);
    }
}