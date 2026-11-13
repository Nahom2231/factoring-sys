package com.fiep.factoring_sys.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserProfileResponse register(RegisterRequest request) {
        return createUser(request, false);
    }

    @Transactional
    public UserProfileResponse createUserAsAdmin(RegisterRequest request) {
        return createUser(request, true);
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserProfileResponse(
                        user.getName(),
                        user.getEmail(),
                        user.getRole()))
                .toList();
    }

    public User authenticate(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new RegistrationException(
                    HttpStatus.UNAUTHORIZED,
                    "Email or password is incorrect.");
        }

        User user = userRepository.findByEmailIgnoreCase(
                        request.getEmail().trim())
                .orElseThrow(() -> new RegistrationException(
                        HttpStatus.UNAUTHORIZED,
                        "Email or password is incorrect."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RegistrationException(
                    HttpStatus.UNAUTHORIZED,
                    "Email or password is incorrect.");
        }

        return user;
    }

    private UserProfileResponse createUser(
            RegisterRequest request,
            boolean allowAdmin) {
        if (request.getRole() == null) {
            throw new RegistrationException(
                    HttpStatus.BAD_REQUEST,
                    "Select an account role.");
        }

        if (!allowAdmin && request.getRole() == Role.ADMIN) {
            throw new RegistrationException(
                    HttpStatus.FORBIDDEN,
                    "Admin accounts can only be created by an existing Admin.");
        }

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new RegistrationException(
                    HttpStatus.CONFLICT,
                    "An account with this email already exists.");
        }

        if (request.getPassword().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new RegistrationException(
                    HttpStatus.BAD_REQUEST,
                    "Password must not exceed 72 UTF-8 bytes.");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        User savedUser = userRepository.save(user);

        return new UserProfileResponse(
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole());
    }
}
