package com.fiep.factoring_sys.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentRepository
        extends JpaRepository<Payment, UUID> {

    long countByStatus(PaymentStatus status);

    @Query("""
            select coalesce(sum(payment.amount), 0)
            from Payment payment
            where payment.factoringDeal.id = :dealId
              and payment.status = :status
              and (:excludedPaymentId is null or payment.id <> :excludedPaymentId)
            """)
    BigDecimal sumAmountByDealAndStatus(
            @Param("dealId") UUID dealId,
            @Param("status") PaymentStatus status,
            @Param("excludedPaymentId") UUID excludedPaymentId);

    @Modifying
    @Query("DELETE FROM Payment p WHERE p.factoringDeal.id = :dealId")
    void deleteByFactoringDealId(@Param("dealId") UUID dealId);
}