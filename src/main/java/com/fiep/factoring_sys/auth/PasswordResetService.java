package com.fiep.factoring_sys.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class PasswordResetService {

    private static final Duration TOKEN_LIFETIME = Duration.ofMinutes(20);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;
    private final String mailHost;
    private final String mailFrom;
    private final String frontendUrl;
    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            JavaMailSender mailSender,
            PasswordEncoder passwordEncoder,
            @Value("${spring.mail.host:${MAIL_HOST:}}") String mailHost,
            @Value("${app.mail.from:${APP_MAIL_FROM:noreply@fiep.et}}") String mailFrom,
            @Value("${APP_FRONTEND_URL:http://localhost:5173}") String frontendUrl) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
        this.mailHost = mailHost;
        this.mailFrom = mailFrom;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public String requestReset(String email) {
        return userRepository.findByEmailIgnoreCase(email.trim())
                .map(this::sendResetEmail)
                .orElse(null);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must not exceed 72 UTF-8 bytes.");
        }

        PasswordResetToken resetToken = tokenRepository
                .findByTokenHash(hashToken(request.token()))
                .filter(token -> token.getUsedAt() == null)
                .filter(token -> token.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "This password reset link is invalid or has expired."));

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.password()));
        resetToken.setUsedAt(Instant.now());
        userRepository.save(user);
        tokenRepository.save(resetToken);
    }

    private String sendResetEmail(User user) {
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String rawToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(tokenBytes);
        tokenRepository.save(new PasswordResetToken(
                user,
                hashToken(rawToken),
                Instant.now().plus(TOKEN_LIFETIME)));

        String resetUrl = frontendUrl.replaceAll("/+$", "")
                + "/reset-password?token="
                + URLEncoder.encode(rawToken, StandardCharsets.UTF_8);

        boolean emailSent = false;
        if (mailHost != null && !mailHost.isBlank() && !mailHost.equalsIgnoreCase("localhost")
                && mailFrom != null && !mailFrom.isBlank()) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(user.getEmail());
            message.setSubject("Reset your FIEP password");
            message.setText("A password reset was requested for your FIEP account. "
                    + "Use this link within 20 minutes:\n\n"
                    + resetUrl
                    + "\n\nIf you did not request this, you can ignore this email.");

            try {
                mailSender.send(message);
                emailSent = true;
            } catch (MailException exception) {
                System.err.println("[PasswordResetService] Failed to send email via SMTP to "
                        + user.getEmail() + ": " + exception.getMessage());
            }
        }

        System.out.println("================================================================================");
        System.out.println("[PASSWORD RESET LINK] User: " + user.getEmail());
        System.out.println("Reset URL: " + resetUrl);
        System.out.println("================================================================================");

        return emailSent ? null : resetUrl;
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable.", exception);
        }
    }
}
