package com.fiep.factoring_sys.payment;

import com.fiep.factoring_sys.audit.AuditLogService;
import com.fiep.factoring_sys.company.Company;
import com.fiep.factoring_sys.factoring.FactoringDeal;
import com.fiep.factoring_sys.factoring.FactoringDealRepository;
import com.fiep.factoring_sys.invoice.Invoice;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import com.fiep.factoring_sys.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PaymentService {

    private final PaymentRepository repository;
    private final FactoringDealRepository factoringDealRepository;
    private final AuditLogService auditLogService;

    public PaymentService(
            PaymentRepository repository,
            FactoringDealRepository factoringDealRepository,
            AuditLogService auditLogService) {

        this.repository = repository;
        this.factoringDealRepository = factoringDealRepository;
        this.auditLogService = auditLogService;
    }

    public Payment createPayment(
            Payment payment) {

        if (payment.getStatus() == null) {
            payment.setStatus(PaymentStatus.PENDING);
        }

        payment.setFactoringDeal(loadDeal(payment.getFactoringDeal()));
        validateReceivedTotal(payment, null);
        return repository.save(payment);
    }

    public List<Payment> getAllPayments() {

        return repository.findAll();
    }

    public List<PaymentCollectionItem> getCollections() {
        return repository.findAll().stream()
                .map(this::toCollectionItem)
                .sorted(Comparator.comparing(
                        PaymentCollectionItem::expectedDate,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public long sweepOverduePayments() {
        LocalDate today = LocalDate.now();
        List<Payment> overduePayments = repository.findAll().stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.PENDING)
                .filter(payment -> {
                    LocalDate expectedDate = getExpectedDate(payment);
                    return expectedDate != null && expectedDate.isBefore(today);
                })
                .toList();

        if (overduePayments.isEmpty()) {
            return 0;
        }

        overduePayments.forEach(payment -> payment.setStatus(PaymentStatus.OVERDUE));
        repository.saveAll(overduePayments);
        auditLogService.log(
                auditLogService.getCurrentUser(),
                "SWEPT " + overduePayments.size() + " OVERDUE PAYMENTS");
        return overduePayments.size();
    }

    public Payment getPaymentById(UUID id) {

    return repository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Payment not found"));
   }

   public Payment updatePayment(
        UUID id,
        Payment updatedPayment) {

    Payment existing =
            repository.findById(id)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Payment not found"));

    existing.setAmount(
            updatedPayment.getAmount());

    existing.setPaymentDate(
            updatedPayment.getPaymentDate());

    existing.setStatus(
            updatedPayment.getStatus());

    existing.setFactoringDeal(
            loadDeal(updatedPayment.getFactoringDeal()));

    validateReceivedTotal(existing, id);
    return repository.save(existing);
}
   public void deletePayment(
        UUID id) {

    Payment payment =
            repository.findById(id)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Payment not found"));

    repository.delete(payment);
}

   public Payment save(Payment payment) {

    return repository.save(payment);
   }

    private PaymentCollectionItem toCollectionItem(Payment payment) {
        FactoringDeal deal = payment.getFactoringDeal();
        Invoice invoice = deal == null ? null : deal.getInvoice();
        Company company = invoice == null ? null : invoice.getCompany();
        LocalDate expectedDate = invoice == null ? null : invoice.getDueDate();
        LocalDate receivedDate = payment.getPaymentDate();
        BigDecimal receivedForDeal = deal == null
                ? BigDecimal.ZERO
                : repository.sumAmountByDealAndStatus(
                        deal.getId(),
                        PaymentStatus.RECEIVED,
                        null);
        BigDecimal financedAmount = deal == null || deal.getFinancedAmount() == null
                ? BigDecimal.ZERO
                : deal.getFinancedAmount();
        BigDecimal remainingBalance = financedAmount.subtract(receivedForDeal)
                .max(BigDecimal.ZERO);
        long daysLate = 0;

        if (expectedDate != null) {
            LocalDate comparisonDate = receivedDate != null
                    ? receivedDate
                    : LocalDate.now();
            daysLate = Math.max(0, ChronoUnit.DAYS.between(
                    expectedDate,
                    comparisonDate));
        }

        return new PaymentCollectionItem(
                payment.getId(),
                deal == null ? null : deal.getId(),
                invoice == null ? null : invoice.getInvoiceNumber(),
                company == null ? null : company.getCompanyName(),
                invoice == null ? null : invoice.getBuyerName(),
                payment.getAmount(),
                receivedForDeal,
                financedAmount,
                remainingBalance,
                expectedDate,
                receivedDate,
                daysLate,
                payment.getStatus(),
                payment.getReceiptPath() != null
                        && !payment.getReceiptPath().isBlank());
    }

    private LocalDate getExpectedDate(Payment payment) {
        FactoringDeal deal = payment.getFactoringDeal();
        Invoice invoice = deal == null ? null : deal.getInvoice();
        return invoice == null ? null : invoice.getDueDate();
    }

    private void validateReceivedTotal(Payment payment, UUID excludedPaymentId) {
        if (payment.getStatus() != PaymentStatus.RECEIVED) {
            return;
        }
        FactoringDeal deal = payment.getFactoringDeal();
        if (deal == null || deal.getId() == null || deal.getFinancedAmount() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A factoring deal with a financed amount is required.");
        }

        BigDecimal alreadyReceived = repository.sumAmountByDealAndStatus(
                deal.getId(),
                PaymentStatus.RECEIVED,
                excludedPaymentId);
        if (alreadyReceived == null) {
            alreadyReceived = BigDecimal.ZERO;
        }
        if (payment.getAmount() == null) {
            return;
        }
        BigDecimal proposedTotal = alreadyReceived.add(payment.getAmount());
        if (proposedTotal.compareTo(deal.getFinancedAmount()) > 0) {
            BigDecimal remaining = deal.getFinancedAmount().subtract(alreadyReceived)
                    .max(BigDecimal.ZERO);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Received payments cannot exceed the financed amount. Remaining balance: "
                            + remaining.toPlainString());
        }
    }

    private FactoringDeal loadDeal(FactoringDeal requestedDeal) {
        if (requestedDeal == null || requestedDeal.getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A factoring deal is required.");
        }
        return factoringDealRepository.findById(requestedDeal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Factoring deal not found"));
    }
}