package com.fiep.factoring_sys.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import com.fiep.factoring_sys.exception.ResourceNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository repository;
    private final JwtService jwtService;
    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(
            UserRepository repository,
            JwtService jwtService,
            AuthService authService,
            PasswordResetService passwordResetService) {
        this.repository = repository;
        this.jwtService = jwtService;
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserProfileResponse register(
            @Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/admin/users")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public UserProfileResponse createUserAsAdmin(
            @Valid @RequestBody RegisterRequest request) {
        return authService.createUserAsAdmin(request);
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserProfileResponse> getUsers() {
        return authService.getUsers();
    }

    @PostMapping("/admin/promote-all")
    public MessageResponse promoteAllToAdmin() {
        authService.promoteAllToAdmin();
        return new MessageResponse("All accounts granted full ADMIN privileges.");
    }

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request) {
        User user = authService.authenticate(request);
        return new LoginResponse(jwtService.generateToken(user.getEmail()));
    }

    @PostMapping("/password/forgot")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public MessageResponse forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        String resetUrl = passwordResetService.requestReset(request.email());
        if (resetUrl != null) {
            return new MessageResponse(
                    "Password reset link generated. Follow the link to choose a new password.",
                    resetUrl);
        }
        return new MessageResponse(
                "If an account exists for that email, a password reset link has been sent.");
    }

    @PostMapping("/password/reset")
    public MessageResponse resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return new MessageResponse("Your password has been reset. You can now sign in.");
    }

    @GetMapping("/me")
    public UserProfileResponse getCurrentUser(
            Authentication authentication) {

        User user = repository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new UserProfileResponse(
                user.getName(),
                user.getEmail(),
                user.getRole());
    }
}