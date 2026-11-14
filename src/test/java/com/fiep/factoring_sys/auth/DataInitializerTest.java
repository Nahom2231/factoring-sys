package com.fiep.factoring_sys.auth;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DataInitializerTest {

    @Test
    void createsConfiguredAdminWithEncodedPassword() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        when(userRepository.findByEmailIgnoreCase("admin@example.com"))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode("a-unique-secure-password"))
                .thenReturn("encoded-password");

        DataInitializer initializer = new DataInitializer(
                userRepository,
                passwordEncoder,
                "Workspace Admin",
                " ADMIN@EXAMPLE.COM ",
                "a-unique-secure-password");

        initializer.run();

        org.mockito.ArgumentCaptor<User> savedUser =
                org.mockito.ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUser.capture());
        assertEquals("admin@example.com", savedUser.getValue().getEmail());
        assertEquals("Workspace Admin", savedUser.getValue().getName());
        assertEquals("encoded-password", savedUser.getValue().getPassword());
        assertEquals(Role.ADMIN, savedUser.getValue().getRole());
    }

    @Test
    void rejectsPartialAdminConfiguration() {
        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.findByEmailIgnoreCase("admin@example.com"))
                .thenReturn(Optional.empty());
        DataInitializer initializer = new DataInitializer(
                userRepository,
                mock(PasswordEncoder.class),
                "Workspace Admin",
                "admin@example.com",
                "");

        assertThrows(IllegalStateException.class, initializer::run);
    }

    @Test
    void promotesConfiguredExistingAccountWithoutChangingItsPassword() {
        UserRepository userRepository = mock(UserRepository.class);
        User analyst = new User();
        analyst.setEmail("analyst@example.com");
        analyst.setName("Existing Analyst");
        analyst.setPassword("existing-password-hash");
        analyst.setRole(Role.CREDIT_ANALYST);
        when(userRepository.findByEmailIgnoreCase("analyst@example.com"))
                .thenReturn(Optional.of(analyst));

        DataInitializer initializer = new DataInitializer(
                userRepository,
                mock(PasswordEncoder.class),
                "",
                "analyst@example.com",
                "");

        initializer.run();

        verify(userRepository).save(analyst);
        assertEquals(Role.ADMIN, analyst.getRole());
        assertEquals("Existing Analyst", analyst.getName());
        assertEquals("existing-password-hash", analyst.getPassword());
    }

    @Test
    void doesNotSeedAnAdminWhenBootstrapCredentialsAreUnset() {
        UserRepository userRepository = mock(UserRepository.class);
        DataInitializer initializer = new DataInitializer(
                userRepository,
                mock(PasswordEncoder.class),
                "Workspace Admin",
                "",
                "");

        initializer.run();

        verify(userRepository, org.mockito.Mockito.never()).save(any(User.class));
    }
}
