package com.fiep.factoring_sys.company;

import java.util.UUID;

public record CompanyOption(
        UUID id,
        String companyName,
        String fiepNumber,
        String tradeName,
        String legalName
) {
    public CompanyOption(UUID id, String companyName) {
        this(id, companyName, null, companyName, companyName);
    }
}
