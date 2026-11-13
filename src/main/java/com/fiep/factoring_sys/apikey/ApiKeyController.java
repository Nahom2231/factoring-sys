package com.fiep.factoring_sys.apikey;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/api-keys")
@PreAuthorize("hasRole('ADMIN')")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    public ApiKeyController(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @GetMapping
    public List<ApiKeyResponse> getAll() {
        return apiKeyService.getAll();
    }

    @PostMapping
    public ApiKeyCreatedResponse create(
            @Valid @RequestBody ApiKeyCreateRequest request,
            Authentication authentication) {
        return apiKeyService.create(request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    public void revoke(
            @PathVariable UUID id,
            Authentication authentication) {
        apiKeyService.revoke(id, authentication.getName());
    }
}
