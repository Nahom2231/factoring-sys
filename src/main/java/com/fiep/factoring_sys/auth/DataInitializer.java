package com.fiep.factoring_sys.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminName;
    private final String adminEmail;
    private final String adminPassword;

    public DataInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap-admin.name:Nahom Befekadu}") String adminName,
            @Value("${app.bootstrap-admin.email:admin@company.com}") String adminEmail,
            @Value("${app.bootstrap-admin.password:AdminPassword123!}") String adminPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminName = adminName == null ? "" : adminName.trim();
        this.adminEmail = adminEmail == null ? "" : adminEmail.trim();
        this.adminPassword = adminPassword == null ? "" : adminPassword;
    }

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this(userRepository, passwordEncoder, "Nahom Befekadu", "", "");
    }

    @Override
    public void run(String... args) {
        if (adminEmail.isBlank()) {
            return;
        }

        userRepository.findByEmailIgnoreCase(adminEmail).ifPresentOrElse(
                user -> {
                    if (!adminName.isBlank()) {
                        user.setName(adminName);
                    }
                    if (!adminPassword.isBlank()) {
                        user.setPassword(passwordEncoder.encode(adminPassword));
                    }
                    user.setRole(Role.ADMIN);
                    userRepository.save(user);
                    System.out.println(">>> Verified/promoted admin account: " + user.getEmail());
                },
                () -> {
                    if (adminPassword.isBlank()) {
                        throw new IllegalStateException("Bootstrap password is required when creating a new admin account.");
                    }
                    User admin = new User();
                    admin.setName(adminName.isBlank() ? "System Admin" : adminName);
                    admin.setEmail(adminEmail.toLowerCase(Locale.ROOT));
                    admin.setPassword(passwordEncoder.encode(adminPassword));
                    admin.setRole(Role.ADMIN);
                    userRepository.save(admin);
                    System.out.println(">>> Created new admin account: " + admin.getEmail());
                }
        );
    }
}
