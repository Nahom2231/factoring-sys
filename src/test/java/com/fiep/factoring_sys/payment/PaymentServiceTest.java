package com.fiep.factoring_sys.payment;

import com.fiep.factoring_sys.audit.AuditLogService;
import com.fiep.factoring_sys.company.Company;
import com.fiep.factoring_sys.factoring.FactoringDeal;
import com.fiep.factoring_sys.factoring.FactoringDealRepository;
import com.fiep.factoring_sys.invoice.Invoice;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository repository;

    @Mock
    private FactoringDealRepository factoringDealRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private PaymentService paymentService;

    @Test
    void defaultsMissingStatusToPending() {
        Payment payment = paymentDueOn(LocalDate.now());
        when(factoringDealRepository.findById(payment.getFactoringDeal().getId()))
                .thenReturn(Optional.of(payment.getFactoringDeal()));
        when(repository.save(payment)).thenReturn(payment);

        Payment result = paymentService.createPayment(payment);

        assertEquals(PaymentStatus.PENDING, result.getStatus());
    }

    @Test
    void preservesSelectedPaymentStatus() {
        Payment payment = new Payment();
        FactoringDeal deal = factoringDeal();
        payment.setFactoringDeal(deal);
        payment.setStatus(PaymentStatus.RECEIVED);
        when(factoringDealRepository.findById(deal.getId())).thenReturn(Optional.of(deal));
        when(repository.sumAmountByDealAndStatus(deal.getId(), PaymentStatus.RECEIVED, null))
                .thenReturn(BigDecimal.ZERO);
        when(repository.save(payment)).thenReturn(payment);

        Payment result = paymentService.createPayment(payment);

        assertEquals(PaymentStatus.RECEIVED, result.getStatus());
    }

    @Test
    void sweepMarksPendingPaymentsPastInvoiceDueDateOverdue() {
        Payment payment = paymentDueOn(LocalDate.now().minusDays(1));
        when(repository.findAll()).thenReturn(List.of(payment));
        when(auditLogService.getCurrentUser()).thenReturn("admin");

        long updatedCount = paymentService.sweepOverduePayments();

        assertEquals(1, updatedCount);
        assertEquals(PaymentStatus.OVERDUE, payment.getStatus());
        verify(repository).saveAll(anyList());
        verify(auditLogService).log("admin", "SWEPT 1 OVERDUE PAYMENTS");
    }

    @Test
    void sweepDoesNotChangePaymentsDueTodayOrAlreadyReceived() {
        Payment dueToday = paymentDueOn(LocalDate.now());
        Payment received = paymentDueOn(LocalDate.now().minusDays(4));
        received.setStatus(PaymentStatus.RECEIVED);
        when(repository.findAll()).thenReturn(List.of(dueToday, received));

        long updatedCount = paymentService.sweepOverduePayments();

        assertEquals(0, updatedCount);
        assertEquals(PaymentStatus.PENDING, dueToday.getStatus());
        assertEquals(PaymentStatus.RECEIVED, received.getStatus());
        verify(repository, never()).saveAll(anyList());
    }

    @Test
    void collectionItemIncludesInvoiceAndCompanyDetails() {
        Payment payment = paymentDueOn(LocalDate.now().minusDays(2));
        when(repository.findAll()).thenReturn(List.of(payment));
        when(repository.sumAmountByDealAndStatus(
                payment.getFactoringDeal().getId(),
                PaymentStatus.RECEIVED,
                null)).thenReturn(BigDecimal.ZERO);

        PaymentCollectionItem collection = paymentService.getCollections().get(0);

        assertEquals("INV-1001", collection.invoiceNumber());
        assertEquals("Northwind Shippers", collection.shipperName());
        assertEquals("Contoso", collection.buyerName());
        assertEquals(LocalDate.now().minusDays(2), collection.expectedDate());
        assertEquals(2, collection.daysLate());
        assertEquals(PaymentStatus.PENDING, collection.status());
        assertEquals(new BigDecimal("1000.00"), collection.financedAmount());
        assertEquals(new BigDecimal("1000.00"), collection.remainingBalance());
    }

    @Test
    void allowsMultipleReceivedPaymentsUpToFinancedAmount() {
        FactoringDeal deal = factoringDeal();
        Payment payment = new Payment();
        payment.setFactoringDeal(deal);
        payment.setAmount(new BigDecimal("400.00"));
        payment.setStatus(PaymentStatus.RECEIVED);
        when(factoringDealRepository.findById(deal.getId())).thenReturn(Optional.of(deal));
        when(repository.sumAmountByDealAndStatus(deal.getId(), PaymentStatus.RECEIVED, null))
                .thenReturn(new BigDecimal("500.00"));
        when(repository.save(payment)).thenReturn(payment);

        assertEquals(payment, paymentService.createPayment(payment));
    }

    @Test
    void rejectsReceivedPaymentsAboveRemainingFinancedAmount() {
        FactoringDeal deal = factoringDeal();
        Payment payment = new Payment();
        payment.setFactoringDeal(deal);
        payment.setAmount(new BigDecimal("600.00"));
        payment.setStatus(PaymentStatus.RECEIVED);
        when(factoringDealRepository.findById(deal.getId())).thenReturn(Optional.of(deal));
        when(repository.sumAmountByDealAndStatus(deal.getId(), PaymentStatus.RECEIVED, null))
                .thenReturn(new BigDecimal("500.00"));

        assertThrows(
                org.springframework.web.server.ResponseStatusException.class,
                () -> paymentService.createPayment(payment));
    }

    private Payment paymentDueOn(LocalDate dueDate) {
        Company company = new Company();
        company.setCompanyName("Northwind Shippers");
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-1001");
        invoice.setBuyerName("Contoso");
        invoice.setDueDate(dueDate);
        invoice.setCompany(company);
        FactoringDeal deal = new FactoringDeal();
        deal.setId(UUID.randomUUID());
        deal.setFinancedAmount(new BigDecimal("1000.00"));
        deal.setInvoice(invoice);
        Payment payment = new Payment();
        payment.setAmount(new java.math.BigDecimal("1250.00"));
        payment.setStatus(PaymentStatus.PENDING);
        payment.setFactoringDeal(deal);
        return payment;
    }

    private FactoringDeal factoringDeal() {
        FactoringDeal deal = new FactoringDeal();
        deal.setId(UUID.randomUUID());
        deal.setFinancedAmount(new BigDecimal("1000.00"));
        return deal;
    }
}
