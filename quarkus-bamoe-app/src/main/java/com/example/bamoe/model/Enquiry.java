package com.example.bamoe.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Enquiry model based on actual API specification
 * Used for both request and response
 */
public class Enquiry implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @JsonProperty("id")
    private String id;
    
    @NotBlank(message = "Title is required")
    @JsonProperty("title")
    private String title;
    
    @NotBlank(message = "Description is required")
    @JsonProperty("description")
    private String description;
    
    @NotNull(message = "Type is required")
    @JsonProperty("type")
    private EnquiryType type;
    
    @NotNull(message = "Status is required")
    @JsonProperty("status")
    private EnquiryStatus status;
    
    @NotNull(message = "Reporter is required")
    @JsonProperty("reporter")
    private User reporter;
    
    @JsonProperty("assignee")
    private User assignee;
    
    @JsonProperty("resolutionNotes")
    private String resolutionNotes;
    
    @JsonProperty("processInstanceId")
    private String processInstanceId;
    
    @JsonProperty("createdAt")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private LocalDateTime createdAt;
    
    @JsonProperty("updatedAt")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private LocalDateTime updatedAt;
    
    @JsonProperty("resolvedAt")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private LocalDateTime resolvedAt;
    
    @JsonProperty("comments")
    private java.util.List<Note> comments;
    
    // Constructors
    public Enquiry() {}
    
    public Enquiry(String title, String description, EnquiryType type, EnquiryStatus status, User reporter) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.status = status;
        this.reporter = reporter;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
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
    
    public java.util.List<Note> getComments() {
        return comments;
    }
    
    public void setComments(java.util.List<Note> comments) {
        this.comments = comments;
    }
    
    @Override
    public String toString() {
        return "Enquiry{" +
                "id='" + id + "'" +
                ", title='" + title + "'" +
                ", description='" + description + "'" +
                ", type=" + type +
                ", status=" + status +
                ", reporter=" + reporter +
                ", assignee=" + assignee +
                ", resolutionNotes='" + resolutionNotes + "'" +
                ", processInstanceId='" + processInstanceId + "'" +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", resolvedAt=" + resolvedAt +
                ", commentsCount=" + (comments != null ? comments.size() : 0) +
                '}';
    }
}