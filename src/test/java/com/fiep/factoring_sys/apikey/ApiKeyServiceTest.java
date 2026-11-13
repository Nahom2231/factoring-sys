package com.fiep.factoring_sys.apikey;

import com.fiep.factoring_sys.audit.AuditLogService;
import com.fiep.factoring_sys.auth.Role;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApiKeyServiceTest {

    @Mock
    private ApiKeyRepository repository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private ApiKeyService apiKeyService;

    @Test
    void createsAHashedKeyWithSelectedRoleAndExpiration() {
        AtomicReference<ApiKey> savedKey = new AtomicReference<>();
        when(repository.save(any(ApiKey.class))).thenAnswer(invocation -> {
            ApiKey key = invocation.getArgument(0);
            savedKey.set(key);
            return key;
        });

        ApiKeyCreatedResponse created = apiKeyService.create(
                new ApiKeyCreateRequest("Integration", Role.FINANCE_OFFICER, 90),
                "admin@example.com");

        assertEquals("Integration", created.name());
        assertEquals(Role.FINANCE_OFFICER, created.role());
        assertEquals(created.prefix() + "_", created.apiKey().substring(0, created.prefix().length() + 1));
        assertNotEquals(created.apiKey(), savedKey.get().getSecretHash());
        assertEquals(created.expiresAt(), created.createdAt().plusDays(90));
    }

    @Test
    void authenticatesValidKeyAndUpdatesLastUsed() {
        AtomicReference<ApiKey> savedKey = new AtomicReference<>();
        when(repository.save(any(ApiKey.class))).thenAnswer(invocation -> {
            ApiKey key = invocation.getArgument(0);
            savedKey.set(key);
            return key;
        });
        ApiKeyCreatedResponse created = apiKeyService.create(
                new ApiKeyCreateRequest("Reporting", Role.CREDIT_ANALYST, 30),
                "admin@example.com");
        when(repository.findByPrefix(created.prefix()))
                .thenReturn(Optional.of(savedKey.get()));

        ApiKeyIdentity identity = apiKeyService.authenticate(created.apiKey());

        assertEquals("Reporting", identity.name());
        assertEquals(Role.CREDIT_ANALYST, identity.role());
        assertNotNull(savedKey.get().getLastUsedAt());
    }

    @Test
    void rejectsExpiredOrRevokedKeys() {
        AtomicReference<ApiKey> savedKey = new AtomicReference<>();
        when(repository.save(any(ApiKey.class))).thenAnswer(invocation -> {
            ApiKey key = invocation.getArgument(0);
            savedKey.set(key);
            return key;
        });
        ApiKeyCreatedResponse created = apiKeyService.create(
                new ApiKeyCreateRequest("Expired", Role.ADMIN, 1),
                "admin@example.com");
        ApiKey key = savedKey.get();
        when(repository.findByPrefix(created.prefix())).thenReturn(Optional.of(key));

        key.setExpiresAt(LocalDateTime.now().minusSeconds(1));
        assertNull(apiKeyService.authenticate(created.apiKey()));

        key.setExpiresAt(LocalDateTime.now().plusDays(1));
        key.setRevokedAt(LocalDateTime.now());
        assertNull(apiKeyService.authenticate(created.apiKey()));
    }
}
