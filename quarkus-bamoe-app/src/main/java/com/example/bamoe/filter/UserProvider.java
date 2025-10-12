package com.example.bamoe.filter;

import com.example.bamoe.model.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Provider for extracting current user information from JWT token.
 * This makes user extraction reusable across all services, filters, and resources.
 */
@ApplicationScoped
public class UserProvider {

    private static final Logger LOG = LoggerFactory.getLogger(UserProvider.class);

    @Inject
    JsonWebToken jwt;

    /**
     * Extract current user information from JWT token.
     * @return User object populated from JWT claims (userId, name, email)
     */
    public User getCurrentUser() {
        String userId = jwt.getClaim("preferred_username");
        String userName = jwt.getClaim("name");
        String userEmail = jwt.getClaim("email");
        
        LOG.debug("Extracted user from JWT - ID: {}, Name: {}, Email: {}", userId, userName, userEmail);
        
        return new User(userId, userName, userEmail);
    }

    /**
     * Get current user ID from token.
     * @return User ID (preferred_username claim)
     */
    public String getCurrentUserId() {
        return jwt.getClaim("preferred_username");
    }

    /**
     * Get current user name from token.
     * @return User name (name claim)
     */
    public String getCurrentUserName() {
        String name = jwt.getClaim("name");
        return name != null ? name : getCurrentUserId();
    }

    /**
     * Get current user email from token.
     * @return User email (email claim)
     */
    public String getCurrentUserEmail() {
        return jwt.getClaim("email");
    }

    /**
     * Check if user has a specific role.
     * @param role Role name to check
     * @return true if user has the role
     */
    public boolean hasRole(String role) {
        return jwt.getGroups() != null && jwt.getGroups().contains(role);
    }

    /**
     * Check if user is in a specific group.
     * @param group Group name to check
     * @return true if user is in the group
     */
    public boolean isInGroup(String group) {
        return hasRole(group);
    }
}

