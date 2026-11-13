package com.fiep.factoring_sys.invoice;

import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(
            InvoiceService invoiceService) {

        this.invoiceService = invoiceService;
    }

    @PostMapping
    public Invoice createInvoice(
          @Valid @RequestBody Invoice invoice) {

        return invoiceService.createInvoice(
                invoice);
    }

    @GetMapping
    public List<Invoice> getAllInvoices() {

        return invoiceService.getAllInvoices();
    }

    @PutMapping("/{id}")
    public Invoice updateInvoice(
            @PathVariable UUID id,
            @Valid @RequestBody Invoice invoice) {
        return invoiceService.updateInvoice(id, invoice);
    }

    @DeleteMapping("/{id}")
    public void deleteInvoice(@PathVariable UUID id) {
        invoiceService.deleteInvoice(id);
    }

    @PostMapping("/{id}/verify")
    public Invoice verifyInvoice(@PathVariable UUID id) {
        return invoiceService.verifyInvoice(id);
    }

    @PostMapping("/{id}/upload")
     public String uploadInvoiceDocument(
        @PathVariable UUID id,
        @RequestParam("file") MultipartFile file)
        throws Exception {

    String fileName =
            file.getOriginalFilename();

    Path path =
            Paths.get(
                    "uploads/" + fileName);

    Files.copy(
            file.getInputStream(),
            path,
            StandardCopyOption.REPLACE_EXISTING);

    Invoice invoice =
            invoiceService.getInvoiceById(id);

    invoice.setDocumentPath(
            path.toString());

    invoiceService.save(invoice);

    return "Invoice document uploaded successfully";

   }
}