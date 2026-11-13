package com.fiep.factoring_sys.pricing;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pricing-rules")
public class PricingRuleController {

    private final PricingRuleService service;

    public PricingRuleController(PricingRuleService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<PricingRule> getAllRules() {
        return service.getAllRules();
    }

    @GetMapping("/default")
    @PreAuthorize("isAuthenticated()")
    public PricingRule getDefaultRule() {
        return service.getDefaultRule().orElse(null);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public PricingRule getRuleById(@PathVariable UUID id) {
        return service.getRuleById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACTORING_OFFICER') or hasRole('FINANCE_OFFICER')")
    public PricingRule createRule(@Valid @RequestBody PricingRule rule) {
        return service.createRule(rule);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACTORING_OFFICER') or hasRole('FINANCE_OFFICER')")
    public PricingRule updateRule(@PathVariable UUID id, @Valid @RequestBody PricingRule rule) {
        return service.updateRule(id, rule);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACTORING_OFFICER')")
    public void deleteRule(@PathVariable UUID id) {
        service.deleteRule(id);
    }
}
