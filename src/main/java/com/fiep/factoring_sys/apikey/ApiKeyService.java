package com.fiep.factoring_sys.apikey;

import com.fiep.factoring_sys.audit.AuditLogService;
import com.fiep.factoring_sys.auth.Role;
import com.fiep.factoring_sys.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class ApiKeyService {

    private static final String KEY_PREFIX = "fiep_live_";
    private static final int KEY_ID_PREFIX_LENGTH = KEY_PREFIX.length() + 36;

    private final ApiKeyRepository repository;
    private final AuditLogService auditLogService;
    private final SecureRandom secureRandom = new SecureRandom();

    public ApiKeyService(
            ApiKeyRepository repository,
            AuditLogService auditLogService) {
        this.repository = repository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ApiKeyCreatedResponse create(ApiKeyCreateRequest request, String createdBy) {
        UUID id = UUID.randomUUID();
        String prefix = KEY_PREFIX + id;
        byte[] secretBytes = new byte[32];
        secureRandom.nextBytes(secretBytes);
        String secret = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(secretBytes);
        String apiKey = prefix + "_" + secret;
        LocalDateTime createdAt = LocalDateTime.now();
        LocalDateTime expiresAt = createdAt.plusDays(request.expiresInDays());

        ApiKey key = new ApiKey();
        key.setId(id);
        key.setName(request.name().trim());
        key.setPrefix(prefix);
        key.setSecretHash(hash(apiKey));
        key.setRole(request.role());
        key.setCreatedBy(createdBy);
        key.setCreatedAt(createdAt);
        key.setExpiresAt(expiresAt);
        repository.save(key);

        auditLogService.log(createdBy, "CREATE API KEY: " + key.getName());
        return new ApiKeyCreatedResponse(
                id,
                key.getName(),
                prefix,
                key.getRole(),
                createdAt,
                expiresAt,
                apiKey);
    }

    @Transactional(readOnly = true)
    public List<ApiKeyResponse> getAll() {
        LocalDateTime now = LocalDateTime.now();
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(key -> toResponse(key, now))
                .toList();
    }

    @Transactional
    public void revoke(UUID id, String revokedBy) {
        ApiKey key = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("API key not found"));
        if (key.getRevokedAt() == null) {
            key.setRevokedAt(LocalDateTime.now());
            repository.save(key);
            auditLogService.log(revokedBy, "REVOKE API KEY: " + key.getName());
        }
    }

    @Transactional
    public ApiKeyIdentity authenticate(String apiKey) {
        if (apiKey == null
                || !apiKey.startsWith(KEY_PREFIX)
                || apiKey.length() <= KEY_ID_PREFIX_LENGTH
                || apiKey.charAt(KEY_ID_PREFIX_LENGTH) != '_') {
            return null;
        }

        String prefix = apiKey.substring(0, KEY_ID_PREFIX_LENGTH);
        ApiKey key = repository.findByPrefix(prefix).orElse(null);
        if (key == null
                || key.getRevokedAt() != null
                || (key.getExpiresAt() != null
                        && !key.getExpiresAt().isAfter(LocalDateTime.now()))
                || !MessageDigest.isEqual(
                        key.getSecretHash().getBytes(StandardCharsets.UTF_8),
                        hash(apiKey).getBytes(StandardCharsets.UTF_8))) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        if (key.getLastUsedAt() == null
                || key.getLastUsedAt().isBefore(now.minusMinutes(5))) {
            key.setLastUsedAt(now);
            repository.save(key);
        }
        return new ApiKeyIdentity(key.getName(), key.getRole());
    }

    private ApiKeyResponse toResponse(ApiKey key, LocalDateTime now) {
        String status = key.getRevokedAt() != null
                ? "REVOKED"
                : key.getExpiresAt() != null && !key.getExpiresAt().isAfter(now)
                        ? "EXPIRED"
                        : "ACTIVE";
        return new ApiKeyResponse(
                key.getId(),
                key.getName(),
                key.getPrefix(),
                key.getRole(),
                key.getCreatedBy(),
                key.getCreatedAt(),
                key.getExpiresAt(),
                key.getRevokedAt(),
                key.getLastUsedAt(),
                status);
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
