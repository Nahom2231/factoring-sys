package com.fiep.factoring_sys.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Reset token is required")
        String token,
        @NotBlank(message = "Password is required")
        @Size(min = 12, max = 64, message = "Password must be between 12 and 64 characters")
        String password) {
}
