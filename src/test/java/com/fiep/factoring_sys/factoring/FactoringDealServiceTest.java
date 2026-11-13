package com.fiep.factoring_sys.factoring;

import com.fiep.factoring_sys.invoice.Invoice;
import com.fiep.factoring_sys.invoice.InvoiceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import com.fiep.factoring_sys.pricing.PricingRule;
import com.fiep.factoring_sys.pricing.PricingRuleRepository;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class FactoringDealServiceTest {

    @Mock
    private FactoringDealRepository repository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private PricingRuleRepository pricingRuleRepository;

    @InjectMocks
    private FactoringDealService service;

    @Test
    void preservesStatusProvidedWhenCreatingDeal() {
        Invoice invoice = invoice(new BigDecimal("1000.00"));
        FactoringDeal deal = deal(invoice, "85", "2");
        deal.setStatus(FactoringStatus.APPROVED);
        when(invoiceRepository.findById(invoice.getId())).thenReturn(Optional.of(invoice));
        when(repository.save(deal)).thenReturn(deal);

        FactoringDeal result = service.createDeal(deal);

        assertEquals(FactoringStatus.APPROVED, result.getStatus());
        assertEquals(new BigDecimal("850.00"), result.getFinancedAmount());
        assertEquals(new BigDecimal("20.00"), result.getFee());
    }

    @Test
    void updatesLinkedInvoice() {
        UUID id = UUID.randomUUID();
        FactoringDeal existing = new FactoringDeal();
        FactoringDeal update = new FactoringDeal();
        Invoice invoice = new Invoice();
        invoice.setId(UUID.randomUUID());
        invoice.setAmount(new BigDecimal("1000"));
        invoice.setInvoiceNumber("INV-2001");
        update.setInvoice(invoice);
        update.setAdvanceRatePercent(new BigDecimal("85"));
        update.setFeeRatePercent(new BigDecimal("2"));
        update.setStatus(FactoringStatus.PENDING);
        when(repository.findById(id)).thenReturn(Optional.of(existing));
        when(invoiceRepository.findById(invoice.getId())).thenReturn(Optional.of(invoice));
        when(repository.save(existing)).thenReturn(existing);

        FactoringDeal result = service.updateDeal(id, update);

        assertEquals(invoice, result.getInvoice());
        assertEquals(new BigDecimal("850.00"), result.getFinancedAmount());
        assertEquals(new BigDecimal("20.00"), result.getFee());
    }

    @Test
    void calculatesNetDisbursementAndRoundsToTwoDecimals() {
        Invoice invoice = invoice(new BigDecimal("1000.01"));
        FactoringDeal deal = deal(invoice, "82.5", "1.25");
        when(invoiceRepository.findById(invoice.getId())).thenReturn(Optional.of(invoice));
        when(repository.save(any(FactoringDeal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        FactoringDeal result = service.createDeal(deal);

        assertEquals(new BigDecimal("825.01"), result.getFinancedAmount());
        assertEquals(new BigDecimal("12.50"), result.getFee());
        assertEquals(new BigDecimal("812.51"), result.getNetDisbursement());
    }

    @Test
    void rejectsFeeRateEqualToAdvanceRate() {
        Invoice invoice = invoice(new BigDecimal("1000.00"));
        FactoringDeal deal = deal(invoice, "5", "5");
        when(invoiceRepository.findById(invoice.getId())).thenReturn(Optional.of(invoice));

        assertThrows(ResponseStatusException.class, () -> service.createDeal(deal));

        verify(repository, never()).save(any(FactoringDeal.class));
    }

    @Test
    void appliesPricingRuleWhenAttachedWithoutExplicitRates() {
        Invoice invoice = invoice(new BigDecimal("2000.00"));
        UUID ruleId = UUID.randomUUID();
        PricingRule rule = new PricingRule("Standard Freight", new BigDecimal("90.00"), new BigDecimal("3.00"));
        rule.setId(ruleId);

        FactoringDeal deal = new FactoringDeal();
        deal.setInvoice(invoice);
        PricingRule ruleRef = new PricingRule();
        ruleRef.setId(ruleId);
        deal.setPricingRule(ruleRef);

        when(invoiceRepository.findById(invoice.getId())).thenReturn(Optional.of(invoice));
        when(pricingRuleRepository.findById(ruleId)).thenReturn(Optional.of(rule));
        when(repository.save(any(FactoringDeal.class))).thenAnswer(i -> i.getArgument(0));

        FactoringDeal result = service.createDeal(deal);

        assertEquals("Standard Freight", result.getPricingRuleName());
        assertEquals(new BigDecimal("90.00"), result.getAdvanceRatePercent());
        assertEquals(new BigDecimal("3.00"), result.getFeeRatePercent());
        assertEquals(new BigDecimal("1800.00"), result.getFinancedAmount());
        assertEquals(new BigDecimal("60.00"), result.getFee());
        assertEquals(new BigDecimal("1740.00"), result.getNetDisbursement());
    }

    @Test
    void allowsCustomManualRatesToOverridePricingRule() {
        Invoice invoice = invoice(new BigDecimal("1000.00"));
        UUID ruleId = UUID.randomUUID();
        PricingRule rule = new PricingRule("Standard Freight", new BigDecimal("90.00"), new BigDecimal("3.00"));
        rule.setId(ruleId);

        FactoringDeal deal = new FactoringDeal();
        deal.setInvoice(invoice);
        PricingRule ruleRef = new PricingRule();
        ruleRef.setId(ruleId);
        deal.setPricingRule(ruleRef);
        // User sets custom rates ("make their own")
        deal.setAdvanceRatePercent(new BigDecimal("95.00"));
        deal.setFeeRatePercent(new BigDecimal("1.50"));

        when(invoiceRepository.findById(invoice.getId())).thenReturn(Optional.of(invoice));
        when(pricingRuleRepository.findById(ruleId)).thenReturn(Optional.of(rule));
        when(repository.save(any(FactoringDeal.class))).thenAnswer(i -> i.getArgument(0));

        FactoringDeal result = service.createDeal(deal);

        assertEquals(new BigDecimal("95.00"), result.getAdvanceRatePercent());
        assertEquals(new BigDecimal("1.50"), result.getFeeRatePercent());
        assertEquals(new BigDecimal("950.00"), result.getFinancedAmount());
        assertEquals(new BigDecimal("15.00"), result.getFee());
        assertEquals(new BigDecimal("935.00"), result.getNetDisbursement());
    }

    private Invoice invoice(BigDecimal amount) {
        Invoice invoice = new Invoice();
        invoice.setId(UUID.randomUUID());
        invoice.setAmount(amount);
        return invoice;
    }

    private FactoringDeal deal(Invoice invoice, String advanceRate, String feeRate) {
        FactoringDeal deal = new FactoringDeal();
        deal.setInvoice(invoice);
        deal.setInvoiceAmount(BigDecimal.ONE);
        deal.setFinancedAmount(BigDecimal.ONE);
        deal.setFee(new BigDecimal("0.01"));
        deal.setAdvanceRatePercent(new BigDecimal(advanceRate));
        deal.setFeeRatePercent(new BigDecimal(feeRate));
        return deal;
    }
}
