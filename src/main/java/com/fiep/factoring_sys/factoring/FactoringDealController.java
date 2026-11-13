package com.fiep.factoring_sys.factoring;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import java.util.UUID;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/factoring-deals")
public class FactoringDealController {

    private final FactoringDealService service;

    public FactoringDealController(
            FactoringDealService service) {

        this.service = service;
    }

    @PostMapping
    @PreAuthorize(
    "hasRole('FACTORING_OFFICER') or hasRole('FINANCE_OFFICER') or hasRole('ADMIN')"
)
    public FactoringDeal createDeal(
           @Valid @RequestBody FactoringDeal deal) {

        return service.createDeal(deal);
    }

    @GetMapping
    @PreAuthorize(
    "hasRole('FACTORING_OFFICER') or hasRole('FINANCE_OFFICER') or hasRole('ADMIN')"
)
    public List<FactoringDeal> getAllDeals() {

        return service.getAllDeals();
    }
    @PutMapping("/{id}")
    @PreAuthorize(
    "hasRole('FACTORING_OFFICER') or hasRole('FINANCE_OFFICER') or hasRole('ADMIN')"
)
    public FactoringDeal updateDeal(
        @PathVariable UUID id,
        @Valid @RequestBody FactoringDeal deal) {

    return service.updateDeal(id, deal);
}

   @DeleteMapping("/{id}")
   @PreAuthorize(
    "hasRole('FACTORING_OFFICER') or hasRole('FINANCE_OFFICER') or hasRole('ADMIN')"
)
    public void deleteDeal(
    @PathVariable UUID id) {

    service.deleteDeal(id);

    }
}