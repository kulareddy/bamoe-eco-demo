package com.example.bamoe.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Comment model for enquiry comments
 */
public class Note implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @JsonProperty("id")
    private String id;
    
    @NotBlank(message = "Comment is required")
    @Size(max = 2000, message = "Comment must not exceed 2000 characters")
    @JsonProperty("comment")
    private String comment;
    
    @JsonProperty("commentedBy")
    private User commentedBy;
    
    @JsonProperty("commentedAt")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private LocalDateTime commentedAt;
    
    public Note() {}
    
    public Note(String comment, User commentedBy) {
        this.comment = comment;
        this.commentedBy = commentedBy;
        this.commentedAt = LocalDateTime.now();
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
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
        return "Comment{" +
                "id='" + id + "'" +
                ", comment='" + comment + "'" +
                ", commentedBy=" + commentedBy +
                ", commentedAt=" + commentedAt +
                '}';
    }
}