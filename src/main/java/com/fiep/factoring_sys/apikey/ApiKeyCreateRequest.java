package com.fiep.factoring_sys.apikey;

import com.fiep.factoring_sys.auth.Role;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ApiKeyCreateRequest(
        @NotBlank @Size(max = 100) String name,
        @NotNull Role role,
        @Min(1) @Max(365) int expiresInDays) {
}
