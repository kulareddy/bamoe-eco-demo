package com.example.springboot.repository;

import com.example.springboot.model.Enquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Simple repository for Enquiry entity with basic CRUD operations.
 */
@Repository
public interface EnquiryRepository extends JpaRepository<Enquiry, UUID> {
    // Find enquiry by Kogito process instance ID
    Optional<Enquiry> findByProcessInstanceId(String processInstanceId);
}