package com.example.springboot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Comment entity for enquiry comments.
 * Represents a comment made on an enquiry with author and timestamp information.
 */
@Entity
@Table(name = "comments")
@EntityListeners(AuditingEntityListener.class)
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Comment text is required")
    @Size(max = 2000, message = "Comment must not exceed 2000 characters")
    @Column(nullable = false, length = 2000)
    private String comment;

    @NotNull(message = "Comment author is required")
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "name", column = @Column(name = "commented_by_name", nullable = false)),
        @AttributeOverride(name = "email", column = @Column(name = "commented_by_email", nullable = false))
    })
    private User commentedBy;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime commentedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enquiry_id", nullable = false)
    private Enquiry enquiry;

    // Constructors
    public Comment() {}

    public Comment(String comment, User commentedBy, Enquiry enquiry) {
        this.comment = comment;
        this.commentedBy = commentedBy;
        this.enquiry = enquiry;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public User getCommentedBy() {
        return commentedBy;
    }

    public void setCommentedBy(User commentedBy) {
        this.commentedBy = commentedBy;
    }

    public LocalDateTime getCommentedAt() {
        return commentedAt;
    }

    public void setCommentedAt(LocalDateTime commentedAt) {
        this.commentedAt = commentedAt;
    }

    public Enquiry getEnquiry() {
        return enquiry;
    }

    public void setEnquiry(Enquiry enquiry) {
        this.enquiry = enquiry;
    }

    @Override
    public String toString() {
        return "Comment{" +
                "id=" + id +
                ", comment='" + comment + '\'' +
                ", commentedBy=" + commentedBy +
                ", commentedAt=" + commentedAt +
                '}';
    }
}