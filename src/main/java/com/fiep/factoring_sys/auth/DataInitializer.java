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
                    user.setName(name);
                    user.setPassword(passwordEncoder.encode(password));
                    user.setRole(Role.ADMIN);
                    userRepository.save(user);
                    System.out.println(">>> Updated existing admin account: " + email);
                },
                () -> {
                    User admin = new User();
                    admin.setName(name);
                    admin.setEmail(email.toLowerCase());
                    admin.setPassword(passwordEncoder.encode(password));
                    admin.setRole(Role.ADMIN);
                    userRepository.save(admin);
                    System.out.println(">>> Created new admin account: " + email);
                }
        );
    }
}
