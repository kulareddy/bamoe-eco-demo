package com.example.springboot.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collection;
import java.util.List;

@Component
@ConditionalOnProperty(name = "spring.security.oauth2.idp.type", havingValue = "azure")
public class AzureEntraProvider implements IdProvider {
    @Override
    public Collection<GrantedAuthority> extractGrantedAuthorities(Jwt jwt) {
        // First try to extract user roles from "roles" claim (user tokens)
        Collection<String> roles = jwt.getClaimAsStringList("roles");
        if (roles != null && !roles.isEmpty()) {
            return roles.stream()
                .filter(role -> 
                    "admin".equals(role) ||
                    "user".equals(role) ||
                    "readonly".equals(role) ||
                    "enquiry-admin".equals(role) ||
                    "enquiry-user".equals(role) ||
                    "enquiry-readonly".equals(role)
                )
                .map(role -> role.startsWith("enquiry-") ? role.substring(8) : role)
                .distinct()
                .map(SimpleGrantedAuthority::new)
                .map(GrantedAuthority.class::cast)
                .toList();
        }
        
        // Try to extract from "scp" claim (scope - common in client credentials)
        String scope = jwt.getClaimAsString("scp");
        if (scope == null || scope.isEmpty()) {
            // Also try "scope" claim
            scope = jwt.getClaimAsString("scope");
        }
        
        if (scope != null && !scope.isEmpty()) {
            return List.of(scope.split(" ")).stream()
                .filter(s -> 
                    "admin".equals(s) ||
                    "user".equals(s) ||
                    "readonly".equals(s) ||
                    "read".equals(s) ||
                    "write".equals(s) ||
                    s.startsWith("enquiry.")
                )
                .map(s -> {
                    // Map common scopes to roles
                    if ("read".equals(s)) return "readonly";
                    if ("write".equals(s)) return "user";
                    if (s.startsWith("enquiry.")) {
                        // Handle Azure app-specific scopes like "enquiry.read", "enquiry.write"
                        String scopePart = s.substring(8); // Remove "enquiry."
                        return switch (scopePart) {
                            case "read" -> "readonly";
                            case "write" -> "user";
                            case "admin" -> "admin";
                            default -> scopePart;
                        };
                    }
                    return s;
                })
                .distinct()
                .map(SimpleGrantedAuthority::new)
                .map(GrantedAuthority.class::cast)
                .toList();
        }
        
        // Check for app roles in "app_roles" claim (Azure-specific for client credentials)
        Collection<String> appRoles = jwt.getClaimAsStringList("app_roles");
        if (appRoles != null && !appRoles.isEmpty()) {
            return appRoles.stream()
                .filter(role -> 
                    "admin".equals(role) ||
                    "user".equals(role) ||
                    "readonly".equals(role) ||
                    "enquiry-admin".equals(role) ||
                    "enquiry-user".equals(role) ||
                    "enquiry-readonly".equals(role)
                )
                .map(role -> role.startsWith("enquiry-") ? role.substring(8) : role)
                .distinct()
                .map(SimpleGrantedAuthority::new)
                .map(GrantedAuthority.class::cast)
                .toList();
        }
        
        // If no roles found, return empty list (will be authenticated but no specific roles)
        return List.of();
    }
}