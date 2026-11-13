package com.fiep.factoring_sys.company;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

class CompanyControllerTest {

    private CompanyService companyService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        companyService = mock(CompanyService.class);
        mockMvc = standaloneSetup(new CompanyController(companyService)).build();
    }

    @Test
    void optionsPathLoadsCompanyOptionsInsteadOfParsingOptionsAsUuid()
            throws Exception {
        UUID companyId = UUID.randomUUID();
        when(companyService.getCompanyOptions())
                .thenReturn(List.of(new CompanyOption(companyId, "Example Company")));

        mockMvc.perform(get("/api/companies/options"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(companyId.toString()))
                .andExpect(jsonPath("$[0].companyName").value("Example Company"));

        verify(companyService).getCompanyOptions();
        verify(companyService, never()).getCompanyById(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void testCreateCompanyWithRegistrationFields() throws Exception {
        UUID companyId = UUID.randomUUID();
        Company company = new Company();
        company.setId(companyId);
        company.setFiepNumber("FIEP-2024-001");
        company.setLegalName("Alpha Logistics PLC");
        company.setTradeName("Alpha Freight");
        company.setKind("Private Limited Company (PLC)");
        company.setEmail("operations@alphafreight.et");
        company.setPhone("+251911223344");
        company.setAddressLine1("Bole Sub-City, Road 4");
        company.setAddressLine2("Suite 201");
        company.setCity("Addis Ababa");
        company.setState("Addis Ababa");
        company.setCountry("Ethiopia");

        when(companyService.createCompany(org.mockito.ArgumentMatchers.any(Company.class)))
                .thenReturn(company);

        String jsonPayload = """
            {
                "fiepNumber": "FIEP-2024-001",
                "legalName": "Alpha Logistics PLC",
                "tradeName": "Alpha Freight",
                "kind": "Private Limited Company (PLC)",
                "email": "operations@alphafreight.et",
                "phone": "+251911223344",
                "addressLine1": "Bole Sub-City, Road 4",
                "addressLine2": "Suite 201",
                "city": "Addis Ababa",
                "state": "Addis Ababa",
                "country": "Ethiopia"
            }
            """;

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/companies")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(companyId.toString()))
                .andExpect(jsonPath("$.fiepNumber").value("FIEP-2024-001"))
                .andExpect(jsonPath("$.legalName").value("Alpha Logistics PLC"))
                .andExpect(jsonPath("$.tradeName").value("Alpha Freight"))
                .andExpect(jsonPath("$.kind").value("Private Limited Company (PLC)"))
                .andExpect(jsonPath("$.email").value("operations@alphafreight.et"))
                .andExpect(jsonPath("$.phone").value("+251911223344"))
                .andExpect(jsonPath("$.addressLine1").value("Bole Sub-City, Road 4"))
                .andExpect(jsonPath("$.city").value("Addis Ababa"))
                .andExpect(jsonPath("$.country").value("Ethiopia"));

        verify(companyService).createCompany(org.mockito.ArgumentMatchers.any(Company.class));
    }
}
