package com.fiep.factoring_sys.pricing;

import com.fiep.factoring_sys.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PricingRuleService {

    private final PricingRuleRepository repository;

    public PricingRuleService(PricingRuleRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    @Transactional
    public void seedDefaultsIfEmpty() {
        if (repository.count() == 0) {
            repository.saveAll(List.of(
                    new PricingRule("Standard Freight", "STANDARD", new BigDecimal("85.00"), new BigDecimal("3.00"), "Standard 85% advance with 3% factoring fee", true),
                    new PricingRule("Prime / High Volume", "PRIME", new BigDecimal("90.00"), new BigDecimal("2.00"), "Preferred 90% advance with discounted 2% fee for high volume", false),
                    new PricingRule("Spot / Single Load", "SPOT", new BigDecimal("80.00"), new BigDecimal("4.00"), "Conservative 80% advance with 4% fee for one-off loads", false),
                    new PricingRule("Accelerated Cash Flow", "ACCELERATED", new BigDecimal("92.00"), new BigDecimal("3.50"), "Aggressive 92% advance for rapid working capital", false)
            ));
        }
    }

    public List<PricingRule> getAllRules() {
        return repository.findAll();
    }

    public Optional<PricingRule> getDefaultRule() {
        return repository.findByIsDefaultTrue()
                .or(() -> repository.findAll().stream().findFirst());
    }

    public PricingRule getRuleById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pricing rule not found"));
    }

    public PricingRule createRule(PricingRule rule) {
        if (Boolean.TRUE.equals(rule.getIsDefault())) {
            repository.findByIsDefaultTrue().ifPresent(existingDefault -> {
                existingDefault.setIsDefault(false);
                repository.save(existingDefault);
            });
        }
        return repository.save(rule);
    }

    public PricingRule updateRule(UUID id, PricingRule updated) {
        PricingRule existing = getRuleById(id);
        existing.setName(updated.getName());
        existing.setCode(updated.getCode());
        existing.setAdvanceRatePercent(updated.getAdvanceRatePercent());
        existing.setFeeRatePercent(updated.getFeeRatePercent());
        existing.setDescription(updated.getDescription());
        existing.setMinAmount(updated.getMinAmount());
        existing.setMaxAmount(updated.getMaxAmount());

        if (Boolean.TRUE.equals(updated.getIsDefault())) {
            repository.findByIsDefaultTrue().ifPresent(currentDefault -> {
                if (!currentDefault.getId().equals(id)) {
                    currentDefault.setIsDefault(false);
                    repository.save(currentDefault);
                }
            });
            existing.setIsDefault(true);
        } else {
            existing.setIsDefault(false);
        }

        return repository.save(existing);
    }

    public void deleteRule(UUID id) {
        PricingRule rule = getRuleById(id);
        repository.delete(rule);
    }
}
