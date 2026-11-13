package com.fiep.factoring_sys.apikey;

import com.fiep.factoring_sys.auth.Role;

public record ApiKeyIdentity(String name, Role role) {
}
