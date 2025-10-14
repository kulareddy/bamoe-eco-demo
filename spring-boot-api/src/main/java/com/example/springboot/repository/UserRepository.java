package com.example.springboot.repository;

import com.example.springboot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for UserEntity operations.
 * Provides CRUD operations and custom queries for user management.
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    /**
     * Find user by email address
     */
    Optional<User> findByEmail(String email);

    /**
     * Find users by name (case-insensitive partial match)
     */
    List<User> findByNameContainingIgnoreCase(String name);

    /**
     * Find users by email domain
     */
    List<User> findByEmailContaining(String emailDomain);

    /**
     * Check if user exists by userId
     */
    boolean existsByUserId(String userId);

    /**
     * Check if user exists by email
     */
    boolean existsByEmail(String email);

    // Note: Bidirectional relationship queries removed
    // Use EnquiryRepository and CommentRepository to find user's enquiries/comments
}
