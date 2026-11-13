package com.fiep.factoring_sys.auth;

public record UserProfileResponse(
        String name,
        String email,
        Role role) {
}
