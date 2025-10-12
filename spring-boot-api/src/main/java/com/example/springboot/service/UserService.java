package com.example.springboot.service;

import com.example.springboot.model.User;
import com.example.springboot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for UserEntity management.
 * Handles user creation, retrieval, and relationship management.
 */
@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Create or update a user
     */
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Create a new user with the provided details
     */
    public User createUser(String userId, String name, String email) {
        User user = new User(userId, name, email);
        return userRepository.save(user);
    }

    /**
     * Find user by userId
     */
    @Transactional(readOnly = true)
    public Optional<User> findByUserId(String userId) {
        return userRepository.findById(userId);
    }

    /**
     * Find user by email
     */
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Get or create user - if user doesn't exist, create it
     */
    public User getOrCreateUser(String userId, String name, String email) {
        return userRepository.findById(userId)
                .orElseGet(() -> {
                    User newUser = new User(userId, name, email);
                    return userRepository.save(newUser);
                });
    }

    /**
     * Update user information
     */
    public User updateUser(String userId, String name, String email) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        user.setName(name);
        user.setEmail(email);
        return userRepository.save(user);
    }

    /**
     * Check if user exists
     */
    @Transactional(readOnly = true)
    public boolean userExists(String userId) {
        return userRepository.existsByUserId(userId);
    }

    /**
     * Check if email is already in use
     */
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Get all users
     */
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Find users by name
     */
    @Transactional(readOnly = true)
    public List<User> findUsersByName(String name) {
        return userRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * Find users by email domain
     */
    @Transactional(readOnly = true)
    public List<User> findUsersByEmailDomain(String emailDomain) {
        return userRepository.findByEmailContaining(emailDomain);
    }

    // Note: Methods that relied on bidirectional relationships removed
    // Use EnquiryService and CommentService to find user's enquiries/comments
}
