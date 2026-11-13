package com.fiep.factoring_sys.invoice;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private InvoiceVerificationClient verificationClient;

    @InjectMocks
    private InvoiceService invoiceService;

    @Test
    void storesVerifiedResultWithoutChangingInvoiceBusinessStatus() {
        UUID id = UUID.randomUUID();
        Invoice invoice = newInvoice(id);
        invoice.setStatus(InvoiceStatus.SUBMITTED);
        when(invoiceRepository.findById(id)).thenReturn(Optional.of(invoice));
        when(verificationClient.verify(any())).thenReturn(
                new InvoiceVerificationApiResponse(true, "Details match"));
        when(invoiceRepository.save(invoice)).thenReturn(invoice);

        Invoice result = invoiceService.verifyInvoice(id);

        assertEquals(InvoiceVerificationStatus.VERIFIED,
                result.getVerificationStatus());
        assertEquals("Details match", result.getVerificationMessage());
        assertEquals(InvoiceStatus.SUBMITTED, result.getStatus());
        assertEquals(id, result.getId());
        verify(invoiceRepository).save(invoice);
    }

    @Test
    void storesRejectedResultFromVerificationService() {
        UUID id = UUID.randomUUID();
        Invoice invoice = newInvoice(id);
        when(invoiceRepository.findById(id)).thenReturn(Optional.of(invoice));
        when(verificationClient.verify(any())).thenReturn(
                new InvoiceVerificationApiResponse(false, "Invoice not found"));
        when(invoiceRepository.save(invoice)).thenReturn(invoice);

        Invoice result = invoiceService.verifyInvoice(id);

        assertEquals(InvoiceVerificationStatus.REJECTED,
                result.getVerificationStatus());
        assertEquals("Invoice not found", result.getVerificationMessage());
    }

    @Test
    void updatingInvoiceResetsVerificationForChangedDetails() {
        UUID id = UUID.randomUUID();
        Invoice invoice = newInvoice(id);
        invoice.setStatus(InvoiceStatus.VERIFIED);
        invoice.setVerificationStatus(InvoiceVerificationStatus.VERIFIED);
        invoice.setVerificationMessage("Details match");
        invoice.setVerificationCheckedAt(LocalDateTime.now());
        Invoice update = newInvoice(id);
        update.setInvoiceNumber("INV-1002");
        update.setBuyerName("Updated Buyer");
        update.setAmount(new BigDecimal("1800.00"));
        when(invoiceRepository.findById(id)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(invoice)).thenReturn(invoice);

        Invoice result = invoiceService.updateInvoice(id, update);

        assertEquals("INV-1002", result.getInvoiceNumber());
        assertEquals("Updated Buyer", result.getBuyerName());
        assertEquals(new BigDecimal("1800.00"), result.getAmount());
        assertEquals(InvoiceStatus.SUBMITTED, result.getStatus());
        assertEquals(InvoiceVerificationStatus.NOT_CHECKED,
                result.getVerificationStatus());
        assertNull(result.getVerificationMessage());
        assertNull(result.getVerificationCheckedAt());
    }

    @Test
    void updatesCarrierShipperAndIssueDate() {
        UUID id = UUID.randomUUID();
        Invoice invoice = newInvoice(id);

        com.fiep.factoring_sys.company.Company carrier = new com.fiep.factoring_sys.company.Company();
        carrier.setId(UUID.randomUUID());
        carrier.setTradeName("Swift Carrier");

        com.fiep.factoring_sys.company.Company shipper = new com.fiep.factoring_sys.company.Company();
        shipper.setId(UUID.randomUUID());
        shipper.setTradeName("Global Shipper");

        Invoice update = new Invoice();
        update.setInvoiceNumber("INV-2026-X");
        update.setCarrier(carrier);
        update.setShipper(shipper);
        update.setShipperName("Global Shipper");
        update.setAmount(new BigDecimal("5000.00"));
        update.setIssueDate(LocalDate.of(2026, 10, 1));
        update.setDueDate(LocalDate.of(2026, 11, 1));

        when(invoiceRepository.findById(id)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(invoice)).thenReturn(invoice);

        Invoice result = invoiceService.updateInvoice(id, update);

        assertEquals("Swift Carrier", result.getCarrierName());
        assertEquals("Global Shipper", result.getShipperName());
        assertEquals("Global Shipper", result.getBuyerName());
        assertEquals(LocalDate.of(2026, 10, 1), result.getIssueDate());
        assertEquals(LocalDate.of(2026, 11, 1), result.getDueDate());
        verify(invoiceRepository).save(invoice);
    }

    private Invoice newInvoice(UUID id) {
        Invoice invoice = new Invoice();
        ReflectionTestUtils.setField(invoice, "id", id);
        invoice.setInvoiceNumber("INV-1001");
        invoice.setBuyerName("Example Buyer");
        invoice.setAmount(new BigDecimal("1250.00"));
        invoice.setDueDate(LocalDate.of(2026, 12, 31));
        return invoice;
    }
}
