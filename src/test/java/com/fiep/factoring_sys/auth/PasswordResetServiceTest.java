package com.fiep.factoring_sys.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PasswordResetServiceTest {

    private UserRepository userRepository;
    private PasswordResetTokenRepository tokenRepository;
    private JavaMailSender mailSender;
    private PasswordEncoder passwordEncoder;
    private PasswordResetService passwordResetService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        tokenRepository = mock(PasswordResetTokenRepository.class);
        mailSender = mock(JavaMailSender.class);
        passwordEncoder = mock(PasswordEncoder.class);
        passwordResetService = new PasswordResetService(
                userRepository,
                tokenRepository,
                mailSender,
                passwordEncoder,
                "smtp.example.com",
                "no-reply@example.com",
                "http://localhost:5173");
    }

    @Test
    void resetRequestSendsMailAndStoresOnlyTokenHash() {
        User user = new User();
        user.setEmail("member@example.com");
        when(userRepository.findByEmailIgnoreCase("member@example.com"))
                .thenReturn(Optional.of(user));

        passwordResetService.requestReset("member@example.com");

        var tokenCaptor = org.mockito.ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        assertEquals(64, tokenCaptor.getValue().getTokenHash().length());
        var messageCaptor = org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());
        org.junit.jupiter.api.Assertions.assertTrue(
                messageCaptor.getValue().getText().contains("/reset-password?token="));
    }

    @Test
    void resetPasswordRejectsExpiredOrUnknownToken() throws Exception {
        String rawToken = "one-time-token";
        String tokenHash = HexFormat.of().formatHex(
                MessageDigest.getInstance("SHA-256")
                        .digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        when(tokenRepository.findByTokenHash(tokenHash))
                .thenReturn(Optional.of(new PasswordResetToken(
                        new User(),
                        tokenHash,
                        Instant.now().minusSeconds(1))));

        assertThrows(
                ResponseStatusException.class,
                () -> passwordResetService.resetPassword(
                        new ResetPasswordRequest(rawToken, "very-long-secure-password")));
    }

    @Test
    void resetPasswordUpdatesAccountForValidToken() throws Exception {
        String rawToken = "one-time-token";
        String tokenHash = HexFormat.of().formatHex(
                MessageDigest.getInstance("SHA-256")
                        .digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        User user = new User();
        PasswordResetToken token = new PasswordResetToken(
                user,
                tokenHash,
                Instant.now().plusSeconds(1200));
        when(tokenRepository.findByTokenHash(tokenHash))
                .thenReturn(Optional.of(token));
        when(passwordEncoder.encode("very-long-secure-password"))
                .thenReturn("encoded-password");

        passwordResetService.resetPassword(
                new ResetPasswordRequest(rawToken, "very-long-secure-password"));

        assertEquals("encoded-password", user.getPassword());
        org.junit.jupiter.api.Assertions.assertNotNull(token.getUsedAt());
        verify(userRepository).save(user);
        verify(tokenRepository).save(token);
    }
}
