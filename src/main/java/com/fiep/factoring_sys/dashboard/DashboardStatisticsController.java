package com.fiep.factoring_sys.dashboard;

import com.fiep.factoring_sys.company.CompanyRepository;
import com.fiep.factoring_sys.credit.CreditAssessmentRepository;
import com.fiep.factoring_sys.factoring.FactoringStatus;
import com.fiep.factoring_sys.factoring.FactoringDealRepository;
import com.fiep.factoring_sys.invoice.InvoiceRepository;
import com.fiep.factoring_sys.invoice.InvoiceVerificationStatus;
import com.fiep.factoring_sys.payment.PaymentRepository;
import com.fiep.factoring_sys.payment.PaymentStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardStatisticsController {

    private final CompanyRepository companyRepository;
    private final CreditAssessmentRepository creditAssessmentRepository;
    private final FactoringDealRepository factoringDealRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    public DashboardStatisticsController(
            CompanyRepository companyRepository,
            CreditAssessmentRepository creditAssessmentRepository,
            FactoringDealRepository factoringDealRepository,
            InvoiceRepository invoiceRepository,
            PaymentRepository paymentRepository) {
        this.companyRepository = companyRepository;
        this.creditAssessmentRepository = creditAssessmentRepository;
        this.factoringDealRepository = factoringDealRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
    }

    @GetMapping("/statistics")
    public Map<String, Long> getStatistics(
            Authentication authentication) {
        Set<String> roles = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toSet());
        Map<String, Long> statistics = new LinkedHashMap<>();

        statistics.put("invoices", invoiceRepository.count());

        if (roles.contains("ROLE_ADMIN")) {
            statistics.put("companies", companyRepository.count());
        }

        if (roles.contains("ROLE_ADMIN")
                || roles.contains("ROLE_CREDIT_ANALYST")) {
            statistics.put("creditAssessments", creditAssessmentRepository.count());
        }

        if (roles.contains("ROLE_ADMIN")
                || roles.contains("ROLE_FACTORING_OFFICER")
                || roles.contains("ROLE_FINANCE_OFFICER")) {
            statistics.put("factoringDeals", factoringDealRepository.count());
        }

        if (roles.contains("ROLE_ADMIN")
                || roles.contains("ROLE_FINANCE_OFFICER")) {
            statistics.put("payments", paymentRepository.count());
        }

        return statistics;
    }

    @GetMapping("/attention")
    public List<DashboardAttentionItem> getAttentionItems(
            Authentication authentication) {
        Set<String> roles = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toSet());
        List<DashboardAttentionItem> items = new ArrayList<>();

        if (roles.contains("ROLE_ADMIN")
                || roles.contains("ROLE_CREDIT_ANALYST")) {
            addIfPresent(
                    items,
                    "invoices-needing-review",
                    invoiceRepository.countByVerificationStatusIn(List.of(
                            InvoiceVerificationStatus.NOT_CHECKED,
                            InvoiceVerificationStatus.REJECTED)),
                    "/invoices");
        }

        if (roles.contains("ROLE_ADMIN")
                || roles.contains("ROLE_FACTORING_OFFICER")) {
            addIfPresent(
                    items,
                    "pending-factoring-deals",
                    factoringDealRepository.countByStatus(FactoringStatus.PENDING),
                    "/factoring");
        }

        if (roles.contains("ROLE_ADMIN")
                || roles.contains("ROLE_FINANCE_OFFICER")) {
            addIfPresent(
                    items,
                    "overdue-payments",
                    paymentRepository.countByStatus(PaymentStatus.OVERDUE),
                    "/payments");
        }

        return items;
    }

    private void addIfPresent(
            List<DashboardAttentionItem> items,
            String key,
            long count,
            String href) {
        if (count > 0) {
            items.add(new DashboardAttentionItem(key, count, href));
        }
    }
}
