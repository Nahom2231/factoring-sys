package com.fiep.factoring_sys.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface CompanyRepository
        extends JpaRepository<Company, UUID> {

    @Query("""
            select new com.fiep.factoring_sys.company.CompanyOption(
                company.id,
                coalesce(nullif(company.tradeName, ''), coalesce(nullif(company.companyName, ''), company.legalName)),
                company.fiepNumber,
                company.tradeName,
                company.legalName
            )
            from Company company
            order by coalesce(nullif(company.tradeName, ''), coalesce(nullif(company.companyName, ''), company.legalName))
            """)
    List<CompanyOption> findAllCompanyOptions();
}