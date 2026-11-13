package com.fiep.factoring_sys.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        authService = new AuthService(userRepository, passwordEncoder);
    }

    @Test
    void publicRegistrationNormalizesEmailAndReturnsSafeProfile() {
        RegisterRequest request = request(Role.CREDIT_ANALYST);
        when(userRepository.existsByEmailIgnoreCase("analyst@example.com"))
                .thenReturn(false);
        when(passwordEncoder.encode("very-long-secure-password"))
                .thenReturn("hashed-password");
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileResponse profile = authService.register(request);

        assertEquals("analyst@example.com", profile.email());
        assertEquals("CREDIT_ANALYST", profile.role().name());
    }

    @Test
    void publicRegistrationCannotCreateAdmin() {
        RegistrationException exception = assertThrows(
                RegistrationException.class,
                () -> authService.register(request(Role.ADMIN)));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }

    private RegisterRequest request(Role role) {
        RegisterRequest request = new RegisterRequest();
        request.setName("Analyst");
        request.setEmail(" Analyst@Example.com ");
        request.setPassword("very-long-secure-password");
        request.setRole(role);
        return request;
    }
}
