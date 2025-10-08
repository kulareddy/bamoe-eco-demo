package com.example.springboot.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "spring.security.oauth2.idp.type", havingValue = "keycloak", matchIfMissing = true)
public class KeycloakProvider implements IdProvider {
    @Override
    public Collection<GrantedAuthority> extractGrantedAuthorities(Jwt jwt) {
        // First try to extract user roles from realm_access (user tokens)
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess != null) {
            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) realmAccess.get("roles");
            if (roles != null && !roles.isEmpty()) {
                return roles.stream()
                    .filter(role -> 
                        "admin".equals(role) ||
                        "user".equals(role) ||
                        "readonly".equals(role)
                    )
                    .map(SimpleGrantedAuthority::new)
                    .map(GrantedAuthority.class::cast)
                    .toList();
            }
        }
        
        // Try to extract client roles from resource_access (client credentials)
        Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
        if (resourceAccess != null) {
            // Look for client-specific roles
            String clientId = jwt.getClaimAsString("azp"); // authorized party (client)
            if (clientId != null && resourceAccess.containsKey(clientId)) {
                @SuppressWarnings("unchecked")
                Map<String, Object> clientAccess = (Map<String, Object>) resourceAccess.get(clientId);
                @SuppressWarnings("unchecked")
                List<String> clientRoles = (List<String>) clientAccess.get("roles");
                if (clientRoles != null && !clientRoles.isEmpty()) {
                    return clientRoles.stream()
                        .filter(role -> 
                            "admin".equals(role) ||
                            "user".equals(role) ||
                            "readonly".equals(role)
                        )
                        .map(SimpleGrantedAuthority::new)
                        .map(GrantedAuthority.class::cast)
                        .toList();
                }
            }
        }
        
        // Check for scope-based authorities (common in client credentials)
        String scope = jwt.getClaimAsString("scope");
        if (scope != null && !scope.isEmpty()) {
            return List.of(scope.split(" ")).stream()
                .filter(s -> 
                    "admin".equals(s) ||
                    "user".equals(s) ||
                    "readonly".equals(s) ||
                    "read".equals(s) ||
                    "write".equals(s)
                )
                .map(s -> {
                    // Map common scopes to roles
                    return switch (s) {
                        case "read" -> "readonly";
                        case "write" -> "user";
                        default -> s;
                    };
                })
                .map(SimpleGrantedAuthority::new)
                .map(GrantedAuthority.class::cast)
                .toList();
        }
        
        // If no roles found, return empty list (will be authenticated but no specific roles)
        return List.of();
    }
}