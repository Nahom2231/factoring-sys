package com.fiep.factoring_sys.auth;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import io.jsonwebtoken.Claims;


@Service
public class JwtService {

    @Value("${security.jwt.secret:}")
    private String secretKey;

    @PostConstruct
    void validateSecretKey() {
        if (secretKey == null
                || secretKey.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be configured with at least 32 UTF-8 bytes.");
        }
    }

    private SecretKey getSigningKey() {

        return Keys.hmacShaKeyFor(
                secretKey.getBytes(
                        StandardCharsets.UTF_8));
    }

    public String generateToken(
            String email) {

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + 86400000))
                .signWith(getSigningKey())
                .compact();
    }
    public String extractEmail(
        String token) {

    Claims claims =
            Jwts.parser()
                    .verifyWith(
                            getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

         return claims.getSubject();
     }

  public boolean isTokenValid(
        String token) {

    try {

        extractEmail(token);

        return true;

    } catch (Exception e) {

        return false;
    }
}


}