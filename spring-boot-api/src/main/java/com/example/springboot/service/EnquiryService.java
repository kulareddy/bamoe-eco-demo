package com.example.springboot.service;

import com.example.springboot.model.Comment;
import com.example.springboot.model.Enquiry;
import com.example.springboot.model.EnquiryStatus;
import com.example.springboot.model.User;
import com.example.springboot.repository.CommentRepository;
import com.example.springboot.repository.EnquiryRepository;
import com.example.springboot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Functional service for managing enquiries.
 */
@Service
@Transactional
public class EnquiryService {

    @Autowired
    private EnquiryRepository repository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    // Basic CRUD
    public Enquiry create(Enquiry enquiry) {
        // Ensure reporter User exists in database
        if (enquiry.getReporter() != null) {
            User reporter = getOrCreateUser(
                enquiry.getReporter().getUserId(),
                enquiry.getReporter().getName(),
                enquiry.getReporter().getEmail()
            );
            enquiry.setReporter(reporter);
        }
        
        // Ensure assignee User exists in database (if provided)
        if (enquiry.getAssignee() != null) {
            User assignee = getOrCreateUser(
                enquiry.getAssignee().getUserId(),
                enquiry.getAssignee().getName(),
                enquiry.getAssignee().getEmail()
            );
            enquiry.setAssignee(assignee);
        }
        
        return repository.save(enquiry);
    }

    @Transactional(readOnly = true)
    public List<Enquiry> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Enquiry> findById(UUID id) {
        return repository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Enquiry> findByProcessInstanceId(String processInstanceId) {
        return repository.findByProcessInstanceId(processInstanceId);
    }

    public Optional<Enquiry> update(UUID id, Enquiry enquiry) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setTitle(enquiry.getTitle());
                    existing.setDescription(enquiry.getDescription());
                    existing.setType(enquiry.getType());
                    existing.setStatus(enquiry.getStatus());
                    
                    // Ensure reporter User exists in database (if provided)
                    if (enquiry.getReporter() != null) {
                        User reporter = getOrCreateUser(
                            enquiry.getReporter().getUserId(),
                            enquiry.getReporter().getName(),
                            enquiry.getReporter().getEmail()
                        );
                        existing.setReporter(reporter);
                    }
                    
                    // Ensure assignee User exists in database (if provided)
                    if (enquiry.getAssignee() != null) {
                        User assignee = getOrCreateUser(
                            enquiry.getAssignee().getUserId(),
                            enquiry.getAssignee().getName(),
                            enquiry.getAssignee().getEmail()
                        );
                        existing.setAssignee(assignee);
                    }
                    
                    existing.setResolutionNotes(enquiry.getResolutionNotes());
                    existing.setResolvedAt(enquiry.getResolvedAt());
                    return repository.save(existing);
                });
    }

    public boolean delete(UUID id) {
        return repository.findById(id)
                .map(enquiry -> {
                    repository.delete(enquiry);
                    return true;
                })
                .orElse(false);
    }

    // Functional operations
    public Optional<Enquiry> updateStatus(UUID id, EnquiryStatus status) {
        return repository.findById(id)
                .map(enquiry -> {
                    enquiry.setStatus(status);
                    if (status == EnquiryStatus.RESOLVED && enquiry.getResolvedAt() == null) {
                        enquiry.setResolvedAt(java.time.LocalDateTime.now());
                    }
                    return repository.save(enquiry);
                });
    }

    public Optional<Enquiry> assign(UUID id, User assignee) {
        return repository.findById(id)
                .map(enquiry -> {
                    // Ensure assignee User exists in database
                    User persistedAssignee = getOrCreateUser(
                        assignee.getUserId(),
                        assignee.getName(),
                        assignee.getEmail()
                    );
                    enquiry.assignTo(persistedAssignee);
                    return repository.save(enquiry);
                });
    }

    public Optional<Enquiry> resolve(UUID id, String resolutionNotes) {
        return repository.findById(id)
                .map(enquiry -> {
                    enquiry.setResolutionNotes(resolutionNotes);
                    enquiry.setStatus(EnquiryStatus.RESOLVED);
                    if (enquiry.getResolvedAt() == null) {
                        enquiry.setResolvedAt(java.time.LocalDateTime.now());
                    }
                    return repository.save(enquiry);
                });
    }

    // Comment management methods
    @Transactional(readOnly = true)
    public List<Comment> getComments(UUID enquiryId) {
        return commentRepository.findByEnquiryIdOrderByCommentedAtAsc(enquiryId);
    }

    public Optional<Comment> addComment(UUID enquiryId, String commentText, User commentedBy) {
        return repository.findById(enquiryId)
                .map(enquiry -> {
                    // Ensure commentedBy User exists in database
                    User persistedUser = getOrCreateUser(
                        commentedBy.getUserId(),
                        commentedBy.getName(),
                        commentedBy.getEmail()
                    );
                    Comment comment = new Comment(commentText, persistedUser, enquiry);
                    enquiry.addComment(comment);
                    return commentRepository.save(comment);
                });
    }

    public boolean deleteComment(UUID enquiryId, UUID commentId) {
        return commentRepository.findById(commentId)
                .filter(comment -> comment.getEnquiry().getId().equals(enquiryId))
                .map(comment -> {
                    commentRepository.delete(comment);
                    return true;
                })
                .orElse(false);
    }

    public Optional<Comment> updateComment(UUID enquiryId, UUID commentId, String newCommentText) {
        return commentRepository.findById(commentId)
                .filter(comment -> comment.getEnquiry().getId().equals(enquiryId))
                .map(comment -> {
                    comment.setComment(newCommentText);
                    return commentRepository.save(comment);
                });
    }

    // Helper methods for User management
    public User getOrCreateUser(String userId, String name, String email) {
        return userRepository.findById(userId)
                .orElseGet(() -> {
                    User newUser = new User(userId, name, email);
                    return userRepository.save(newUser);
                });
    }

    public Optional<User> findUserById(String userId) {
        return userRepository.findById(userId);
    }

    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

}