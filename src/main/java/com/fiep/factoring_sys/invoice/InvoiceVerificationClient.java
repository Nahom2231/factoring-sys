package com.fiep.factoring_sys.invoice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.net.URI;

@Component
public class InvoiceVerificationClient {

    private final RestClient restClient;
    private final String verificationUrl;
    private final String apiKey;
    private final String apiKeyHeader;

    public InvoiceVerificationClient(
            RestClient.Builder restClientBuilder,
            @Value("${invoice.verification.url:}") String verificationUrl,
            @Value("${invoice.verification.api-key:}") String apiKey,
            @Value("${invoice.verification.api-key-header:X-API-Key}")
            String apiKeyHeader) {
        this.restClient = restClientBuilder.build();
        this.verificationUrl = verificationUrl;
        this.apiKey = apiKey;
        this.apiKeyHeader = apiKeyHeader;
    }

    public InvoiceVerificationApiResponse verify(
            InvoiceVerificationRequest request) {
        if (verificationUrl.isBlank()
                || apiKey.isBlank()
                || apiKeyHeader.isBlank()) {
            throw new InvoiceVerificationException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Invoice verification is not configured. Set "
                            + "INVOICE_VERIFICATION_URL and "
                            + "INVOICE_VERIFICATION_API_KEY, and ensure "
                            + "INVOICE_VERIFICATION_API_KEY_HEADER is not blank.");
        }

        URI endpoint;
        try {
            endpoint = URI.create(verificationUrl);
        } catch (IllegalArgumentException exception) {
            throw invalidVerificationUrl();
        }

        if (!endpoint.isAbsolute()
                || endpoint.getHost() == null
                || endpoint.getUserInfo() != null
                || !("https".equalsIgnoreCase(endpoint.getScheme())
                || isLocalHttpEndpoint(endpoint))) {
            throw invalidVerificationUrl();
        }

        try {
            InvoiceVerificationApiResponse response = restClient.post()
                    .uri(verificationUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(apiKeyHeader, apiKey)
                    .body(request)
                    .retrieve()
                    .body(InvoiceVerificationApiResponse.class);

            if (response == null || response.verified() == null) {
                throw new InvoiceVerificationException(
                        HttpStatus.BAD_GATEWAY,
                        "Invoice verification service returned an invalid response.");
            }

            if (response.message() != null
                    && response.message().length() > 2000) {
                throw new InvoiceVerificationException(
                        HttpStatus.BAD_GATEWAY,
                        "Invoice verification service returned a message that is too long.");
            }

            return response;
        } catch (InvoiceVerificationException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw new InvoiceVerificationException(
                    HttpStatus.BAD_GATEWAY,
                    "Invoice verification service could not be reached or returned an error.");
        }
    }

    private boolean isLocalHttpEndpoint(URI endpoint) {
        String host = endpoint.getHost();
        return "http".equalsIgnoreCase(endpoint.getScheme())
                && ("localhost".equalsIgnoreCase(host)
                || "127.0.0.1".equals(host)
                || "::1".equals(host)
                || "[::1]".equals(host));
    }

    private InvoiceVerificationException invalidVerificationUrl() {
        return new InvoiceVerificationException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "INVOICE_VERIFICATION_URL must be an absolute HTTPS URL. "
                        + "HTTP is allowed only for localhost development.");
    }
}
