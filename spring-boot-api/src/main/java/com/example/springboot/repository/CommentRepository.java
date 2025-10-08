package com.example.springboot.repository;

import com.example.springboot.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for Comment entity with basic CRUD operations.
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    
    /**
     * Find all comments for a specific enquiry, ordered by commented date.
     */
    List<Comment> findByEnquiryIdOrderByCommentedAtAsc(UUID enquiryId);
}