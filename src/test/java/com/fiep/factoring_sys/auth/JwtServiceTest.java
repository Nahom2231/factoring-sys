package com.fiep.factoring_sys.auth;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    @Test
    void generatedTokenCanBeValidatedAndReturnsItsSubject() {
        JwtService service = new JwtService();
        ReflectionTestUtils.setField(
                service,
                "secretKey",
                "test-only-signing-key-for-fiep-automated-tests");
        service.validateSecretKey();

        String token = service.generateToken("analyst@example.com");

        assertTrue(service.isTokenValid(token));
        assertEquals("analyst@example.com", service.extractEmail(token));
        assertFalse(service.isTokenValid(token + "tampered"));
    }
}
