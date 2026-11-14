package com.fiep.factoring_sys.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        ensureAdmin("Nahom Befekadu", "admin@company.com", "AdminPassword123!");
        ensureAdmin("System Admin", "admin@gmail.com", "Admin123456!");
    }

    private void ensureAdmin(String name, String email, String password) {
        userRepository.findByEmailIgnoreCase(email).ifPresentOrElse(
                user -> {
                    if (user.getRole() != Role.ADMIN) {
                        user.setRole(Role.ADMIN);
                        userRepository.save(user);
                    }
                },
                () -> {
                    User admin = new User();
                    admin.setName(name);
                    admin.setEmail(email.toLowerCase());
                    admin.setPassword(passwordEncoder.encode(password));
                    admin.setRole(Role.ADMIN);
                    userRepository.save(admin);
                }
        );
    }
}
