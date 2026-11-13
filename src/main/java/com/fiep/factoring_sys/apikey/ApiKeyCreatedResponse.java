package com.fiep.factoring_sys.apikey;

import com.fiep.factoring_sys.auth.Role;

import java.time.LocalDateTime;
import java.util.UUID;

public record ApiKeyCreatedResponse(
        UUID id,
        String name,
        String prefix,
        Role role,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        String apiKey) {
}
