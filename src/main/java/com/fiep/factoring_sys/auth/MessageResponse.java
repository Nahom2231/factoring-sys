package com.fiep.factoring_sys.auth;
 
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MessageResponse(String message, String resetUrl) {
    public MessageResponse(String message) {
        this(message, null);
    }
}
