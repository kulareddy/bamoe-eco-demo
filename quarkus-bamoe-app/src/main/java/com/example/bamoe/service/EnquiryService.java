package com.example.bamoe.service;

import com.example.bamoe.client.enquiry.EnquiryGateway;
import com.example.bamoe.model.Comment;
import com.example.bamoe.model.Enquiry;
import com.example.bamoe.model.EnquiryStatus;
import com.example.bamoe.model.User;
import com.example.bamoe.model.ErrorResponse;
import com.example.bamoe.util.JsonUtils;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import org.kie.kogito.internal.process.runtime.KogitoProcessContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;

/**
 * Service for handling enquiry operations
 */
@ApplicationScoped
public class EnquiryService {

    private static final Logger LOG = LoggerFactory.getLogger(EnquiryService.class);

    @Inject
    EnquiryGateway enquiryGateway;

    /**
     * Create a new enquiry
     */
    public Enquiry createEnquiry(Enquiry enquiry, KogitoProcessContext kcontext) {
        LOG.info("EnquiryService: createEnquiry called");
        LOG.info("enquiry:\n{}", JsonUtils.toPrettyJson(enquiry));
        
        try {
            // Set default values if not provided
            if (enquiry.getStatus() == null) {
                enquiry.setStatus(EnquiryStatus.OPEN);
            }
            if (enquiry.getCreatedAt() == null) {
                enquiry.setCreatedAt(LocalDateTime.now());
            }
            if (enquiry.getUpdatedAt() == null) {
                enquiry.setUpdatedAt(LocalDateTime.now());
            }
            String processInstanceId = kcontext.getProcessInstance().getId();
            LOG.info("ProcessInstanceId: {}", processInstanceId);
            enquiry.setProcessInstanceId(processInstanceId);
            Enquiry createdEnquiry = enquiryGateway.createEnquiry(enquiry);
            LOG.info("Enquiry created successfully with ID: {}", createdEnquiry.getId());
            return createdEnquiry;
            
        } catch (WebApplicationException e) {
            LOG.error("EnquiryService: WebApplicationException from enquiry service");
            ErrorResponse errorResponse = e.getResponse().readEntity(ErrorResponse.class);
            kcontext.setVariable("errorResponse", errorResponse);
            throw e;
        } catch (Exception e) {
            LOG.error("EnquiryService: Unexpected error", e);
            ErrorResponse errorResponse = new ErrorResponse(
                "ERR500",
                "Enquiry Service Error",
                e.getMessage(),
                "enquiry-service",
                "/enquiries",
                "POST"
            );
            kcontext.setVariable("errorResponse", errorResponse);
            throw new jakarta.ws.rs.WebApplicationException("EnquiryService error: " + e.getMessage(), e);
        }
    }

    /**
     * Auto-assign enquiry based on type and priority
     */
    public Enquiry assignEnquiry(Enquiry enquiry, KogitoProcessContext kcontext) {
        LOG.info("Auto-assigning enquiry: {}", enquiry.getTitle());
        
        try {
            enquiry.setStatus(EnquiryStatus.IN_PROGRESS);
            enquiry.setUpdatedAt(LocalDateTime.now());
            
            Enquiry updatedEnquiry = enquiryGateway.updateEnquiry(enquiry.getId(), enquiry);
            LOG.info("Enquiry assigned to: {}", updatedEnquiry.getAssignee() != null ? updatedEnquiry.getAssignee().getName() : "Unassigned");
            return updatedEnquiry;
            
        } catch (WebApplicationException e) {
            LOG.error("EnquiryService: WebApplicationException from enquiry service during assignment");
            ErrorResponse errorResponse = e.getResponse().readEntity(ErrorResponse.class);
            kcontext.setVariable("errorResponse", errorResponse);
            throw e;
        } catch (Exception e) {
            LOG.error("EnquiryService: Unexpected error during assignment", e);
            ErrorResponse errorResponse = new ErrorResponse(
                "ERR500",
                "Enquiry Assignment Error",
                e.getMessage(),
                "enquiry-service",
                "/enquiries/" + enquiry.getId(),
                "PUT"
            );
            kcontext.setVariable("errorResponse", errorResponse);
            throw new jakarta.ws.rs.WebApplicationException("EnquiryService assignment error: " + e.getMessage(), e);
        }
    }

    /**
     * Escalate enquiry to management
     */
    public Enquiry escalateEnquiry(Enquiry enquiry, KogitoProcessContext kcontext) {
        LOG.info("Escalating enquiry: {}", enquiry.getTitle());
        
        try {
            // Create management user
            User manager = new User("Management", "manager@example.com");
            enquiry.setAssignee(manager);
            enquiry.setStatus(EnquiryStatus.IN_PROGRESS);
            enquiry.setUpdatedAt(LocalDateTime.now());
            
            Enquiry updatedEnquiry = enquiryGateway.updateEnquiry(enquiry.getId(), enquiry);
            LOG.info("Enquiry escalated to management");
            return updatedEnquiry;
            
        } catch (WebApplicationException e) {
            LOG.error("EnquiryService: WebApplicationException from enquiry service during escalation");
            ErrorResponse errorResponse = e.getResponse().readEntity(ErrorResponse.class);
            kcontext.setVariable("errorResponse", errorResponse);
            throw e;
        } catch (Exception e) {
            LOG.error("EnquiryService: Unexpected error during escalation", e);
            ErrorResponse errorResponse = new ErrorResponse(
                "ERR500",
                "Enquiry Escalation Error",
                e.getMessage(),
                "enquiry-service",
                "/enquiries/" + enquiry.getId(),
                "PUT"
            );
            kcontext.setVariable("errorResponse", errorResponse);
            throw new jakarta.ws.rs.WebApplicationException("EnquiryService escalation error: " + e.getMessage(), e);
        }
    }

    /**
     * Close enquiry with resolution
     */
    public Enquiry closeEnquiry(Enquiry enquiry, String resolutionNotes, KogitoProcessContext kcontext) {
        LOG.info("Closing enquiry: {} with resolution: {}", enquiry.getTitle(), resolutionNotes);
        
        try {
            enquiry.setStatus(EnquiryStatus.RESOLVED);
            enquiry.setResolutionNotes(resolutionNotes);
            enquiry.setResolvedAt(LocalDateTime.now());
            enquiry.setUpdatedAt(LocalDateTime.now());
            
            Enquiry updatedEnquiry = enquiryGateway.updateEnquiry(enquiry.getId(), enquiry);
            LOG.info("Enquiry closed successfully");
            return updatedEnquiry;
            
        } catch (WebApplicationException e) {
            LOG.error("EnquiryService: WebApplicationException from enquiry service during closure");
            ErrorResponse errorResponse = e.getResponse().readEntity(ErrorResponse.class);
            kcontext.setVariable("errorResponse", errorResponse);
            throw e;
        } catch (Exception e) {
            LOG.error("EnquiryService: Unexpected error during closure", e);
            ErrorResponse errorResponse = new ErrorResponse(
                "ERR500",
                "Enquiry Closure Error",
                e.getMessage(),
                "enquiry-service",
                "/enquiries/" + enquiry.getId(),
                "PUT"
            );
            kcontext.setVariable("errorResponse", errorResponse);
            throw new jakarta.ws.rs.WebApplicationException("EnquiryService closure error: " + e.getMessage(), e);
        }
    }

    /**
     * Cancel enquiry
     */
    public Enquiry cancelEnquiry(Enquiry enquiry, String cancellationReason, KogitoProcessContext kcontext) {
        LOG.info("Cancelling enquiry: {} - Reason: {}", enquiry.getTitle(), cancellationReason);
        
        try {
            enquiry.setStatus(EnquiryStatus.CANCELLED);
            enquiry.setResolutionNotes("Cancelled: " + cancellationReason);
            enquiry.setUpdatedAt(LocalDateTime.now());
            
            Enquiry updatedEnquiry = enquiryGateway.updateEnquiry(enquiry.getId(), enquiry);
            LOG.info("Enquiry cancelled successfully");
            return updatedEnquiry;
            
        } catch (WebApplicationException e) {
            LOG.error("EnquiryService: WebApplicationException from enquiry service during cancellation");
            ErrorResponse errorResponse = e.getResponse().readEntity(ErrorResponse.class);
            kcontext.setVariable("errorResponse", errorResponse);
            throw e;
        } catch (Exception e) {
            LOG.error("EnquiryService: Unexpected error during cancellation", e);
            ErrorResponse errorResponse = new ErrorResponse(
                "ERR500",
                "Enquiry Cancellation Error",
                e.getMessage(),
                "enquiry-service",
                "/enquiries/" + enquiry.getId(),
                "PUT"
            );
            kcontext.setVariable("errorResponse", errorResponse);
            throw new jakarta.ws.rs.WebApplicationException("EnquiryService cancellation error: " + e.getMessage(), e);
        }
    }

    /**
     * Reopen enquiry for further investigation
     */
    public Enquiry reopenEnquiry(Enquiry enquiry, KogitoProcessContext kcontext) {
        LOG.info("Reopening enquiry: {} - Reason: {}", enquiry.getTitle(), "reopenReason");
        
        try {
            enquiry.setStatus(EnquiryStatus.OPEN);
            enquiry.setResolutionNotes(null);
            enquiry.setResolvedAt(null);
            enquiry.setUpdatedAt(LocalDateTime.now());
            
            Enquiry updatedEnquiry = enquiryGateway.updateEnquiry(enquiry.getId(), enquiry);
            LOG.info("Enquiry reopened successfully");
            return updatedEnquiry;
            
        } catch (WebApplicationException e) {
            LOG.error("EnquiryService: WebApplicationException from enquiry service during reopen");
            ErrorResponse errorResponse = e.getResponse().readEntity(ErrorResponse.class);
            kcontext.setVariable("errorResponse", errorResponse);
            throw e;
        } catch (Exception e) {
            LOG.error("EnquiryService: Unexpected error during reopen", e);
            ErrorResponse errorResponse = new ErrorResponse(
                "ERR500",
                "Enquiry Reopen Error",
                e.getMessage(),
                "enquiry-service",
                "/enquiries/" + enquiry.getId(),
                "PUT"
            );
            kcontext.setVariable("errorResponse", errorResponse);
            throw new jakarta.ws.rs.WebApplicationException("EnquiryService reopen error: " + e.getMessage(), e);
        }
    }

    /**
     * Add comment to enquiry
     */
    public Enquiry addComment(Enquiry enquiry, Comment comment, KogitoProcessContext kcontext) {
        LOG.info("Adding comment to enquiry: {} by: {}", enquiry.getId(), comment.getCommentedBy().getName());
        
        try {
            // Add comment to the enquiry
            if (enquiry.getComments() == null) {
                enquiry.setComments(new java.util.ArrayList<>());
            }
            
            comment.setCommentedAt(LocalDateTime.now());
            
            enquiry.getComments().add(comment);
            enquiry.setUpdatedAt(LocalDateTime.now());
            
            Enquiry updatedEnquiry = enquiryGateway.updateEnquiry(enquiry.getId(), enquiry);
            LOG.info("Comment added successfully to enquiry: {}", enquiry.getId());
            return updatedEnquiry;
            
        } catch (WebApplicationException e) {
            LOG.error("EnquiryService: WebApplicationException from enquiry service during comment addition");
            ErrorResponse errorResponse = e.getResponse().readEntity(ErrorResponse.class);
            kcontext.setVariable("errorResponse", errorResponse);
            throw e;
        } catch (Exception e) {
            LOG.error("EnquiryService: Unexpected error during comment addition", e);
            ErrorResponse errorResponse = new ErrorResponse(
                "ERR500",
                "Enquiry Comment Addition Error",
                e.getMessage(),
                "enquiry-service",
                "/enquiries/" + enquiry.getId(),
                "PUT"
            );
            kcontext.setVariable("errorResponse", errorResponse);
            throw new jakarta.ws.rs.WebApplicationException("EnquiryService comment addition error: " + e.getMessage(), e);
        }
    }

    /**
     * Get enquiry by ID
     */
    public Enquiry getEnquiry(String id, KogitoProcessContext kcontext) {
        LOG.info("Retrieving enquiry: {}", id);
        
        try {
            Enquiry enquiry = enquiryGateway.getEnquiry(id);
            LOG.info("Enquiry retrieved successfully");
            return enquiry;
            
        } catch (WebApplicationException e) {
            LOG.error("EnquiryService: WebApplicationException from enquiry service during retrieval");
            ErrorResponse errorResponse = e.getResponse().readEntity(ErrorResponse.class);
            kcontext.setVariable("errorResponse", errorResponse);
            throw e;
        } catch (Exception e) {
            LOG.error("EnquiryService: Unexpected error during retrieval", e);
            ErrorResponse errorResponse = new ErrorResponse(
                "ERR500",
                "Enquiry Retrieval Error",
                e.getMessage(),
                "enquiry-service",
                "/enquiries/" + id,
                "GET"
            );
            kcontext.setVariable("errorResponse", errorResponse);
            throw new jakarta.ws.rs.WebApplicationException("EnquiryService retrieval error: " + e.getMessage(), e);
        }
    }

    /**
     * Update enquiry status
     */
    public Enquiry updateEnquiryStatus(Enquiry enquiry, EnquiryStatus status, KogitoProcessContext kcontext) {
        LOG.info("Updating enquiry {} status to: {}", enquiry.getId(), status);
        
        try {
            enquiry.setStatus(status);
            enquiry.setUpdatedAt(LocalDateTime.now());
            
            Enquiry updatedEnquiry = enquiryGateway.updateEnquiry(enquiry.getId(), enquiry);
            LOG.info("Enquiry status updated successfully");
            return updatedEnquiry;
            
        } catch (WebApplicationException e) {
            LOG.error("EnquiryService: WebApplicationException from enquiry service during status update");
            ErrorResponse errorResponse = e.getResponse().readEntity(ErrorResponse.class);
            kcontext.setVariable("errorResponse", errorResponse);
            throw e;
        } catch (Exception e) {
            LOG.error("EnquiryService: Unexpected error during status update", e);
            ErrorResponse errorResponse = new ErrorResponse(
                "ERR500",
                "Enquiry Status Update Error",
                e.getMessage(),
                "enquiry-service",
                "/enquiries/" + enquiry.getId(),
                "PUT"
            );
            kcontext.setVariable("errorResponse", errorResponse);
            throw new jakarta.ws.rs.WebApplicationException("EnquiryService status update error: " + e.getMessage(), e);
        }
    }
}