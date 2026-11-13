package com.fiep.factoring_sys.invoice;

import com.fiep.factoring_sys.factoring.FactoringDealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiep.factoring_sys.exception.ResourceNotFoundException;

import java.util.List;
import java.time.LocalDateTime;

import java.util.UUID;


@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceVerificationClient verificationClient;

    @Autowired(required = false)
    private FactoringDealRepository factoringDealRepository;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            InvoiceVerificationClient verificationClient) {

        this.invoiceRepository = invoiceRepository;
        this.verificationClient = verificationClient;
    }

    public Invoice createInvoice(
            Invoice invoice) {

        invoice.syncLegacyAndNewFields();
        invoice.setStatus(
                InvoiceStatus.SUBMITTED);
        invoice.setVerificationStatus(
                InvoiceVerificationStatus.NOT_CHECKED);
        invoice.setVerificationMessage(null);
        invoice.setVerificationCheckedAt(null);

        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getAllInvoices() {

        return invoiceRepository.findAll();
    }

    public Invoice updateInvoice(UUID id, Invoice updatedInvoice) {
        Invoice invoice = getInvoiceById(id);
        invoice.setInvoiceNumber(updatedInvoice.getInvoiceNumber());
        invoice.setBuyerName(updatedInvoice.getBuyerName());
        invoice.setShipperName(updatedInvoice.getShipperName());
        invoice.setShipper(updatedInvoice.getShipper());
        invoice.setCarrier(updatedInvoice.getCarrier());
        invoice.setCarrierName(updatedInvoice.getCarrierName());
        invoice.setCompany(updatedInvoice.getCompany());
        invoice.setAmount(updatedInvoice.getAmount());
        invoice.setIssueDate(updatedInvoice.getIssueDate());
        invoice.setDueDate(updatedInvoice.getDueDate());
        invoice.syncLegacyAndNewFields();
        invoice.setStatus(InvoiceStatus.SUBMITTED);
        invoice.setVerificationStatus(InvoiceVerificationStatus.NOT_CHECKED);
        invoice.setVerificationMessage(null);
        invoice.setVerificationCheckedAt(null);
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public void deleteInvoice(UUID id) {
        Invoice invoice = getInvoiceById(id);
        if (factoringDealRepository != null) {
            factoringDealRepository.deleteByInvoiceId(id);
        }
        invoiceRepository.delete(invoice);
    }

    public Invoice getInvoiceById(
        UUID id) {

    return invoiceRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Invoice not found"));
    }
    public Invoice save(
        Invoice invoice) {

    return invoiceRepository.save(invoice);
}

    public Invoice verifyInvoice(UUID id) {
        Invoice invoice = getInvoiceById(id);
        InvoiceVerificationApiResponse response =
                verificationClient.verify(
                        new InvoiceVerificationRequest(
                                invoice.getId(),
                                invoice.getInvoiceNumber(),
                                invoice.getBuyerName(),
                                invoice.getAmount(),
                                invoice.getDueDate()));

        invoice.setVerificationStatus(
                response.verified()
                        ? InvoiceVerificationStatus.VERIFIED
                        : InvoiceVerificationStatus.REJECTED);
        invoice.setVerificationMessage(response.message());
        invoice.setVerificationCheckedAt(LocalDateTime.now());

        return invoiceRepository.save(invoice);
    }
}