package com.fiep.factoring_sys.factoring;

import com.fiep.factoring_sys.exception.ResourceNotFoundException;
import com.fiep.factoring_sys.invoice.Invoice;
import com.fiep.factoring_sys.invoice.InvoiceRepository;
import com.fiep.factoring_sys.pricing.PricingRule;
import com.fiep.factoring_sys.pricing.PricingRuleRepository;
import com.fiep.factoring_sys.payment.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class FactoringDealService {

    private final FactoringDealRepository repository;
    private final InvoiceRepository invoiceRepository;
    private final PricingRuleRepository pricingRuleRepository;

    @Autowired(required = false)
    private PaymentRepository paymentRepository;

    public FactoringDealService(
            FactoringDealRepository repository,
            InvoiceRepository invoiceRepository) {
        this(repository, invoiceRepository, null);
    }

    @Autowired
    public FactoringDealService(
            FactoringDealRepository repository,
            InvoiceRepository invoiceRepository,
            @Autowired(required = false) PricingRuleRepository pricingRuleRepository) {

        this.repository = repository;
        this.invoiceRepository = invoiceRepository;
        this.pricingRuleRepository = pricingRuleRepository;
    }

    public FactoringDeal createDeal(FactoringDeal deal) {
        if (deal.getStatus() == null) {
            deal.setStatus(FactoringStatus.PENDING);
        }

        calculateAmounts(deal);
        return repository.save(deal);
    }

    public List<FactoringDeal> getAllDeals() {
        return repository.findAll();
    }

    public FactoringDeal updateDeal(UUID id, FactoringDeal updatedDeal) {
        FactoringDeal existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deal not found"));

        existing.setStatus(updatedDeal.getStatus());
        existing.setInvoice(updatedDeal.getInvoice());
        existing.setPricingRule(updatedDeal.getPricingRule());
        existing.setPricingRuleName(updatedDeal.getPricingRuleName());
        existing.setAdvanceRatePercent(updatedDeal.getAdvanceRatePercent());
        existing.setFeeRatePercent(updatedDeal.getFeeRatePercent());
        calculateAmounts(existing);

        return repository.save(existing);
    }

    @Transactional
    public void deleteDeal(UUID id) {
        if (id == null) {
            return;
        }
        if (paymentRepository != null) {
            paymentRepository.deleteByFactoringDealId(id);
        }
        repository.deleteByDealId(id);
    }

    private void calculateAmounts(FactoringDeal deal) {
        if (deal.getInvoice() == null || deal.getInvoice().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "An invoice is required for a factoring deal.");
        }
        Invoice invoice = invoiceRepository.findById(deal.getInvoice().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        // If pricing rule is attached by ID, resolve it
        PricingRule resolvedRule = null;
        if (deal.getPricingRule() != null && deal.getPricingRule().getId() != null && pricingRuleRepository != null) {
            resolvedRule = pricingRuleRepository.findById(deal.getPricingRule().getId()).orElse(null);
            if (resolvedRule != null) {
                deal.setPricingRule(resolvedRule);
                deal.setPricingRuleName(resolvedRule.getName());
            }
        }

        // If advance/fee rate are missing, fall back to resolved rule or default rule
        if ((deal.getAdvanceRatePercent() == null || deal.getFeeRatePercent() == null) && pricingRuleRepository != null) {
            if (resolvedRule == null) {
                resolvedRule = pricingRuleRepository.findByIsDefaultTrue().orElse(null);
            }
            if (resolvedRule != null) {
                deal.setPricingRule(resolvedRule);
                deal.setPricingRuleName(resolvedRule.getName());
                if (deal.getAdvanceRatePercent() == null) {
                    deal.setAdvanceRatePercent(resolvedRule.getAdvanceRatePercent());
                }
                if (deal.getFeeRatePercent() == null) {
                    deal.setFeeRatePercent(resolvedRule.getFeeRatePercent());
                }
            }
        }

        BigDecimal advanceRate = deal.getAdvanceRatePercent();
        BigDecimal feeRate = deal.getFeeRatePercent();

        if (advanceRate == null || feeRate == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Advance rate and fee rate are required.");
        }
        if (advanceRate.signum() <= 0 || advanceRate.compareTo(new BigDecimal("100")) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Advance rate must be greater than 0 and no more than 100 percent.");
        }
        if (feeRate.signum() <= 0 || feeRate.compareTo(advanceRate) >= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Fee rate must be greater than 0 and lower than the advance rate.");
        }

        BigDecimal invoiceAmount = invoice.getAmount();
        if (invoiceAmount == null || invoiceAmount.signum() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The selected invoice must have a positive amount.");
        }
        BigDecimal financedAmount = percentageOf(invoiceAmount, advanceRate);
        BigDecimal fee = percentageOf(invoiceAmount, feeRate);
        if (financedAmount.signum() <= 0
                || fee.signum() <= 0
                || financedAmount.compareTo(fee) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The rates must produce a positive financed amount, fee, and net disbursement.");
        }

        deal.setInvoice(invoice);
        deal.setInvoiceAmount(invoiceAmount);
        deal.setFinancedAmount(financedAmount);
        deal.setFee(fee);

        if (deal.getPricingRuleName() == null || deal.getPricingRuleName().isBlank()) {
            deal.setPricingRuleName(resolvedRule != null ? resolvedRule.getName() : "Custom");
        }
    }

    private BigDecimal percentageOf(BigDecimal amount, BigDecimal percentage) {
        return amount.multiply(percentage)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
    }
}
