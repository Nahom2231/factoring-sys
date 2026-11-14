package com.fiep.factoring_sys.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Ensure standard admin accounts exist and have ADMIN privileges
        ensureAdmin("Nahom Befekadu", "admin@company.com", "AdminPassword123!");
        ensureAdmin("System Admin", "admin@gmail.com", "Admin123456!");

        // Automatically promote all existing users to ADMIN so they have full workspace access
        userRepository.findAll().forEach(user -> {
            if (user.getRole() != Role.ADMIN) {
                user.setRole(Role.ADMIN);
                userRepository.save(user);
                System.out.println(">>> Granted ADMIN privileges to: " + user.getEmail());
            }
        });
    }

    private void ensureAdmin(String name, String email, String password) {
        userRepository.findByEmailIgnoreCase(email).ifPresentOrElse(
                user -> {
                    user.setName(name);
                    user.setRole(Role.ADMIN);
                    userRepository.save(user);
                    System.out.println(">>> Verified admin account: " + email);
                },
                () -> {
                    User admin = new User();
                    admin.setName(name);
                    admin.setEmail(email.toLowerCase(Locale.ROOT));
                    admin.setPassword(passwordEncoder.encode(password));
                    admin.setRole(Role.ADMIN);
                    userRepository.save(admin);
                    System.out.println(">>> Created new admin account: " + email);
                }
        );
    }
}
