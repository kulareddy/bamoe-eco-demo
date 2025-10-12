package com.example.bamoe.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Note model for Quarkus BAMOE application.
 * Represents a note/comment made on an enquiry.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Note implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("comment")
    private String comment;

    @JsonProperty("commentedBy")
    private User commentedBy;

    @JsonProperty("commentedAt")
    private LocalDateTime commentedAt;

    // Constructors
    public Note() {}

    public Note(String comment, User commentedBy) {
        this.comment = comment;
        this.commentedBy = commentedBy;
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

    @Override
    public String toString() {
        return "Note{" +
                "id=" + id +
                ", comment='" + comment + '\'' +
                ", commentedBy=" + commentedBy +
                ", commentedAt=" + commentedAt +
                '}';
    }
}

