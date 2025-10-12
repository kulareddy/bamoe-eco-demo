package com.example.bamoe.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Enquiry model for Quarkus BAMOE application.
 * This is a POJO for REST client communication and BAMOE process variables.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Enquiry implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("title")
    private String title;

    @JsonProperty("description")
    private String description;

    @JsonProperty("type")
    private EnquiryType type;

    @JsonProperty("status")
    private EnquiryStatus status = EnquiryStatus.OPEN;

    @JsonProperty("reporter")
    private User reporter;

    @JsonProperty("assignee")
    private User assignee;

    @JsonProperty("resolutionNotes")
    private String resolutionNotes;

    @JsonProperty("processInstanceId")
    private String processInstanceId;

    @JsonProperty("comments")
    private List<Note> comments = new ArrayList<>();

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    @JsonProperty("resolvedAt")
    private LocalDateTime resolvedAt;

    // Constructors
    public Enquiry() {}

    public Enquiry(String title, String description, EnquiryType type, User reporter) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.reporter = reporter;
    }

    // Convenience constructor with user details
    public Enquiry(String title, String description, EnquiryType type, String reporterUserId, String reporterName, String reporterEmail) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.reporter = new User(reporterUserId, reporterName, reporterEmail);
    }

    // Business methods
    public Enquiry assignTo(User assignee) {
        this.assignee = assignee;
        return this;
    }

    public Enquiry assignTo(String assigneeUserId, String assigneeName, String assigneeEmail) {
        this.assignee = new User(assigneeUserId, assigneeName, assigneeEmail);
        return this;
    }

    public boolean isOverdue(int daysThreshold) {
        return status != EnquiryStatus.RESOLVED && 
               status != EnquiryStatus.CLOSED && 
               status != EnquiryStatus.CANCELLED &&
               createdAt != null &&
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

    public List<Note> getComments() {
        return comments;
    }

    public void setComments(List<Note> comments) {
        this.comments = comments;
    }

    public void addComment(Note comment) {
        if (this.comments == null) {
            this.comments = new ArrayList<>();
        }
        this.comments.add(comment);
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

    @Override
    public String toString() {
        return "Enquiry{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", type=" + type +
                ", status=" + status +
                ", reporter=" + reporter +
                ", assignee=" + assignee +
                '}';
    }
}
