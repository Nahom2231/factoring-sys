package com.fiep.factoring_sys.audit;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository repository;

    public AuditLogService(
            AuditLogRepository repository) {

        this.repository = repository;
    }

    public void log(
            String username,
            String action) {

        AuditLog auditLog =
                new AuditLog();

        auditLog.setUsername(username);
        auditLog.setAction(action);
        auditLog.setTimestamp(
                LocalDateTime.now());

        repository.save(auditLog);
    }

    public String getCurrentUser() {

    Authentication authentication =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication();

    return authentication.getName();
}


public List<AuditLog> getAllLogs() {

    return repository.findAll();
}
}