package com.fiep.factoring_sys.apikey;

import com.fiep.factoring_sys.auth.Role;

import java.time.LocalDateTime;
import java.util.UUID;

public record ApiKeyResponse(
        UUID id,
        String name,
        String prefix,
        Role role,
        String createdBy,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        LocalDateTime revokedAt,
        LocalDateTime lastUsedAt,
        String status) {
}
