package com.fiep.factoring_sys.payment;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService service;

    public PaymentController(
            PaymentService service) {

        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public Payment createPayment(
            @Valid @RequestBody Payment payment) {

        return service.createPayment(payment);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public List<Payment> getAllPayments() {

        return service.getAllPayments();
    }

    @GetMapping("/collections")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public List<PaymentCollectionItem> getCollections() {
        return service.getCollections();
    }

    @PostMapping("/sweep-overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public OverdueSweepResponse sweepOverduePayments() {
        return new OverdueSweepResponse(service.sweepOverduePayments());
    }

    @PostMapping("/{id}/receipt")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public String uploadReceipt(
        @PathVariable UUID id,
        @RequestParam("file")
        MultipartFile file)
        throws Exception {

    String fileName =
            file.getOriginalFilename();

    Path path =
            Paths.get(
                    "uploads/" + fileName);

    try {

    Files.copy(
            file.getInputStream(),
            path,
            StandardCopyOption.REPLACE_EXISTING);

    Payment payment =
            service.getPaymentById(id);

    payment.setReceiptPath(
            path.toString());

    service.save(payment);

    return "Receipt uploaded successfully";

} catch (Exception e) {

    e.printStackTrace();

    throw e;

   }
}
  @PutMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
   public Payment updatePayment(
  @PathVariable UUID id,
  @Valid @RequestBody Payment payment) {

    return service.updatePayment(
            id,
            payment);
}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public void deletePayment(
        @PathVariable UUID id) {

    service.deletePayment(id);
  }
}
