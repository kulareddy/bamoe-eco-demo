package com.example.springboot.service;

import com.example.springboot.model.Comment;
import com.example.springboot.model.Enquiry;
import com.example.springboot.model.EnquiryStatus;
import com.example.springboot.model.User;
import com.example.springboot.repository.CommentRepository;
import com.example.springboot.repository.EnquiryRepository;
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

    // Basic CRUD
    public Enquiry create(Enquiry enquiry) {
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
                    existing.setReporter(enquiry.getReporter());
                    existing.setAssignee(enquiry.getAssignee());
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
                    enquiry.assignTo(assignee);
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
                    Comment comment = new Comment(commentText, commentedBy, enquiry);
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

}