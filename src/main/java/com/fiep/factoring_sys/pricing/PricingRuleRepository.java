package com.fiep.factoring_sys.pricing;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface PricingRuleRepository extends JpaRepository<PricingRule, UUID> {

    Optional<PricingRule> findByIsDefaultTrue();

    Optional<PricingRule> findByCode(String code);
}
