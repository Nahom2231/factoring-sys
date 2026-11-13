package com.fiep.factoring_sys.invoice;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class InvoiceVerificationClientTest {

    @Test
    void sendsInvoiceAndApiKeyToConfiguredVerificationUrl() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server =
                MockRestServiceServer.bindTo(builder).build();
        String invoiceId = UUID.randomUUID().toString();

        server.expect(requestTo("https://verify.example.test/invoices"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("X-API-Key", "test-api-key"))
                .andExpect(content().json("""
                        {
                          "invoiceId": "%s",
                          "invoiceNumber": "INV-1001",
                          "buyerName": "Example Buyer",
                          "amount": 1250.00,
                          "dueDate": "2026-12-31"
                        }
                        """.formatted(invoiceId)))
                .andRespond(withSuccess(
                        "{\"verified\":true,\"message\":\"Invoice details match\"}",
                        MediaType.APPLICATION_JSON));

        InvoiceVerificationClient client = new InvoiceVerificationClient(
                builder,
                "https://verify.example.test/invoices",
                "test-api-key",
                "X-API-Key");

        InvoiceVerificationApiResponse response = client.verify(
                new InvoiceVerificationRequest(
                        UUID.fromString(invoiceId),
                        "INV-1001",
                        "Example Buyer",
                        new BigDecimal("1250.00"),
                        LocalDate.of(2026, 12, 31)));

        assertTrue(response.verified());
        server.verify();
    }
}
