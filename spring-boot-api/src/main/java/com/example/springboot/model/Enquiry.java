package com.example.springboot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * JPA Entity and REST model for enquiry operations.
 * This single model serves both as JPA entity and REST DTO following modern Spring Boot practices.
 */
@Entity
@Table(name = "enquiries", indexes = {
    @Index(name = "idx_enquiry_type", columnList = "type"),
    @Index(name = "idx_enquiry_status", columnList = "status"),
    @Index(name = "idx_enquiry_reporter", columnList = "reporter_user_id"),
    @Index(name = "idx_enquiry_assignee", columnList = "assignee_user_id"),
    @Index(name = "idx_enquiry_created_at", columnList = "createdAt")
})
@EntityListeners(AuditingEntityListener.class)
public class Enquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    @Column(nullable = false, length = 2000)
    private String description;

    @NotNull(message = "Enquiry type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnquiryType type;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnquiryStatus status = EnquiryStatus.OPEN;

    @NotNull(message = "Reporter is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reporter_user_id", nullable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assignee_user_id")
    private User assignee;

    @Size(max = 2000, message = "Resolution notes must not exceed 2000 characters")
    @Column(length = 2000)
    private String resolutionNotes;

    @Column(name = "process_instance_id")
    private String processInstanceId;

    @OneToMany(mappedBy = "enquiry", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("commentedAt ASC")
    private List<Comment> comments = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime resolvedAt;

    // Default constructor
    public Enquiry() {}

    // Constructor with required fields
    public Enquiry(String title, String description, EnquiryType type, User reporter) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.reporter = reporter;
    }

    // Convenience constructor with string parameters
    public Enquiry(String title, String description, EnquiryType type, String reporterUserId, String reporterName, String reporterEmail) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.reporter = new User(reporterUserId, reporterName, reporterEmail);
    }

    // Simple business methods - no automatic state changes
    public Enquiry assignTo(User assignee) {
        this.assignee = assignee;
        return this;
    }

    // Convenience method for assignment with user details
    public Enquiry assignTo(String assigneeUserId, String assigneeName, String assigneeEmail) {
        this.assignee = new User(assigneeUserId, assigneeName, assigneeEmail);
        return this;
    }


    public boolean isOverdue(int daysThreshold) {
        return status != EnquiryStatus.RESOLVED && 
               status != EnquiryStatus.CLOSED && 
               status != EnquiryStatus.CANCELLED &&
               createdAt.isBefore(LocalDateTime.now().minusDays(daysThreshold));
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public EnquiryType getType() {
        return type;
    }

    public void setType(EnquiryType type) {
        this.type = type;
    }

    public EnquiryStatus getStatus() {
        return status;
    }

    public void setStatus(EnquiryStatus status) {
        this.status = status;
    }

    public User getReporter() {
        return reporter;
    }

    public void setReporter(User reporter) {
        this.reporter = reporter;
    }

    public User getAssignee() {
        return assignee;
    }

    public void setAssignee(User assignee) {
        this.assignee = assignee;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public String getProcessInstanceId() {
        return processInstanceId;
    }

    public void setProcessInstanceId(String processInstanceId) {
        this.processInstanceId = processInstanceId;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public void addComment(Comment comment) {
        comments.add(comment);
        comment.setEnquiry(this);
    }

    public void removeComment(Comment comment) {
        comments.remove(comment);
        comment.setEnquiry(null);
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

}