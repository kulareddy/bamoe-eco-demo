package com.example.bamoe.service;

import com.example.bamoe.client.enquiry.EnquiryGateway;
import com.example.bamoe.model.Note;
import com.example.bamoe.model.Enquiry;
import com.example.bamoe.model.EnquiryStatus;
import com.example.bamoe.model.User;
import com.example.bamoe.model.ErrorResponse;
import com.example.bamoe.filter.UserProvider;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import org.kie.kogito.internal.process.runtime.KogitoProcessContext;
import org.kie.kogito.process.ProcessInstance;
import java.lang.reflect.Field;

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

    @Inject
    UserProvider userProvider;

    /**
     * Get predefined manager user for escalation.
     * @return Manager user object
     */
    private User getManagerUser() {
        return new User("manager1", "Manager One", "manager1@example.com");
    }


    /**
     * Create a new enquiry
     */
    public Enquiry createEnquiry(Enquiry enquiry, KogitoProcessContext kcontext) {
        LOG.info("Creating enquiry: {}", enquiry.getTitle());
        
        // Enrich reporter with token user if needed
        User tokenUser = userProvider.getCurrentUser();
        if (enquiry.getReporter() == null) {
            enquiry.setReporter(tokenUser);
        } else {
            User reporter = enquiry.getReporter();
            if (reporter.getUserId() == null || reporter.getUserId().isEmpty()) reporter.setUserId(tokenUser.getUserId());
            if (reporter.getName() == null || reporter.getName().isEmpty()) reporter.setName(tokenUser.getName());
            if (reporter.getEmail() == null || reporter.getEmail().isEmpty()) reporter.setEmail(tokenUser.getEmail());
        }
        
        // Set defaults
        if (enquiry.getStatus() == null) enquiry.setStatus(EnquiryStatus.OPEN);
        enquiry.setProcessInstanceId(kcontext.getProcessInstance().getId());
        
        LOG.info("Reporter: {}", enquiry.getReporter().getName());
        return enquiryGateway.createEnquiry(enquiry);
    }

    /**
     * Handle task claim - Kogito-native version using ProcessInstance API.
     * Called from event listeners when tasks are claimed by users.
     */
    @SuppressWarnings({"rawtypes", "unchecked"})
    public void handleTaskClaim(ProcessInstance<?> processInstance, String userId) {
        LOG.info("EnquiryService.handleTaskClaim: Task claimed - updating enquiry by user: {}", userId);
        LOG.info("EnquiryService.handleTaskClaim: Process instance ID: {}", processInstance.id());
        
        // Get the process model directly
        Object processModel = processInstance.variables();
        LOG.debug("EnquiryService.handleTaskClaim: Process model type: {}", processModel.getClass().getName());
        
        // Use reflection to get the enquiry field
        Enquiry enquiry = getEnquiryFromModel(processModel);
        if (enquiry == null) {
            LOG.warn("EnquiryService.handleTaskClaim: No enquiry found in process variables");
            return;
        }

        LOG.info("EnquiryService.handleTaskClaim: Found enquiry: {} - current status: {}", enquiry.getTitle(), enquiry.getStatus());
        LOG.info("EnquiryService.handleTaskClaim: Enquiry ID: {}", enquiry.getId());

        enquiry.setAssignee(userProvider.getUserById(userId));
        enquiry.setStatus(EnquiryStatus.IN_PROGRESS);
        
        LOG.info("EnquiryService.handleTaskClaim: Updated enquiry - Status: {}, Assignee: {}", enquiry.getStatus(), enquiry.getAssignee());

        // Update the enquiry in the external service
        try {
            LOG.info("EnquiryService.handleTaskClaim: Updating enquiry in external service...");
            Enquiry updatedEnquiry = enquiryGateway.updateEnquiry(enquiry.getId().toString(), enquiry);
            LOG.info("EnquiryService.handleTaskClaim: Successfully updated enquiry in external service - Status: {}, Assignee: {}", 
                updatedEnquiry.getStatus(), updatedEnquiry.getAssignee());
        } catch (Exception e) {
            LOG.error("EnquiryService.handleTaskClaim: Failed to update enquiry in external service", e);
        }

        // Update the enquiry in the process model
        setEnquiryInModel(processModel, enquiry);
        
        // Update the process instance
        ((ProcessInstance) processInstance).updateVariables(processModel);
        
        LOG.info("EnquiryService.handleTaskClaim: Successfully updated process instance with enquiry changes");
    }
    
    /**
     * Handle task release - Kogito-native version using ProcessInstance API.
     * Called from event listeners when tasks are released back to the group pool.
     */
    @SuppressWarnings({"rawtypes", "unchecked"})
    public void handleTaskRelease(ProcessInstance<?> processInstance) {
        LOG.info("EnquiryService.handleTaskRelease: Task released - updating enquiry");
        LOG.info("EnquiryService.handleTaskRelease: Process instance ID: {}", processInstance.id());
        
        // Get the process model directly
        Object processModel = processInstance.variables();
        LOG.debug("EnquiryService.handleTaskRelease: Process model type: {}", processModel.getClass().getName());
        
        // Use reflection to get the enquiry field
        Enquiry enquiry = getEnquiryFromModel(processModel);
        if (enquiry == null) {
            LOG.warn("EnquiryService.handleTaskRelease: No enquiry found in process variables");
            return;
        }

        LOG.info("EnquiryService.handleTaskRelease: Found enquiry: {} - current status: {}", enquiry.getTitle(), enquiry.getStatus());
        LOG.info("EnquiryService.handleTaskRelease: Enquiry ID: {}", enquiry.getId());

        enquiry.setAssignee(null);
        enquiry.setStatus(EnquiryStatus.OPEN);
        
        LOG.info("EnquiryService.handleTaskRelease: Updated enquiry - Status: {}, Assignee: {}", enquiry.getStatus(), enquiry.getAssignee());

        // Update the enquiry in the external service
        try {
            LOG.info("EnquiryService.handleTaskRelease: Updating enquiry in external service...");
            Enquiry updatedEnquiry = enquiryGateway.updateEnquiry(enquiry.getId().toString(), enquiry);
            LOG.info("EnquiryService.handleTaskRelease: Successfully updated enquiry in external service - Status: {}, Assignee: {}", 
                updatedEnquiry.getStatus(), updatedEnquiry.getAssignee());
        } catch (Exception e) {
            LOG.error("EnquiryService.handleTaskRelease: Failed to update enquiry in external service", e);
        }

        // Update the enquiry in the process model
        setEnquiryInModel(processModel, enquiry);
        
        // Update the process instance
        ((ProcessInstance) processInstance).updateVariables(processModel);
        
        LOG.info("EnquiryService.handleTaskRelease: Successfully updated process instance with enquiry changes");
    }


    /**
     * Escalate enquiry to management
     */
    public Enquiry escalateEnquiry(Enquiry enquiry, KogitoProcessContext kcontext) {
        LOG.info("Escalating enquiry: {}", enquiry.getTitle());
        
        enquiry.setAssignee(getManagerUser());
        LOG.info("Escalated to: {}", enquiry.getAssignee().getName());
        return updateEnquiryStatus(enquiry, EnquiryStatus.IN_PROGRESS, kcontext);
    }

    public Enquiry resolveEnquiry(Enquiry enquiry, String resolveNotes, KogitoProcessContext kcontext) {
        LOG.info("Resolving enquiry: {}", enquiry.getTitle());
        String enquiryId = enquiry.getId().toString();
        
        // Orchestrate: add comment, then update status (single refresh)
        addComment(resolveNotes, enquiryId);
        enquiry.setStatus(EnquiryStatus.RESOLVED);
        enquiry.setResolutionNotes(resolveNotes);
        enquiry.setResolvedAt(LocalDateTime.now());
        
        return enquiryGateway.updateEnquiry(enquiryId, enquiry);
    }

    /**
     * Close enquiry with resolution
     */
    public Enquiry closeEnquiry(Enquiry enquiry, String closeNotes, KogitoProcessContext kcontext) {
        LOG.info("Closing enquiry: {}", enquiry.getTitle());
        String enquiryId = enquiry.getId().toString();
        
        // Orchestrate: add comment, then update status (single refresh)
        addComment(closeNotes, enquiryId);
        enquiry.setStatus(EnquiryStatus.CLOSED);
        enquiry.setResolutionNotes(closeNotes);
        enquiry.setResolvedAt(LocalDateTime.now());
        
        return enquiryGateway.updateEnquiry(enquiryId, enquiry);
    }

    /**
     * Cancel enquiry
     */
    public Enquiry cancelEnquiry(Enquiry enquiry, String cancelNotes, KogitoProcessContext kcontext) {
        LOG.info("Cancelling enquiry: {}", enquiry.getTitle());
        String enquiryId = enquiry.getId().toString();
        String fullNotes = "Cancelled: " + cancelNotes;
        
        // Orchestrate: add comment, then update status (single refresh)
        addComment(fullNotes, enquiryId);
        enquiry.setStatus(EnquiryStatus.CANCELLED);
        enquiry.setResolutionNotes(fullNotes);
        
        return enquiryGateway.updateEnquiry(enquiryId, enquiry);
    }

    /**
     * Reopen enquiry for further investigation
     */
    public Enquiry reopenEnquiry(Enquiry enquiry, String reopenNotes, KogitoProcessContext kcontext) {
        LOG.info("Reopening enquiry: {}", enquiry.getTitle());
        String enquiryId = enquiry.getId().toString();
        
        // Orchestrate: add comment, then update status (single refresh)
        addComment(reopenNotes, enquiryId);
        enquiry.setStatus(EnquiryStatus.OPEN);
        enquiry.setResolutionNotes(reopenNotes);
        enquiry.setResolvedAt(null);
        
        return enquiryGateway.updateEnquiry(enquiryId, enquiry);
    }

    /**
     * Add comment to enquiry (BPMN signal handler - returns refreshed enquiry).
     */
    public Enquiry addComment(String commentText, KogitoProcessContext kcontext) {
        String enquiryId = ((Enquiry) kcontext.getVariable("enquiry")).getId().toString();
        LOG.info("Adding comment to enquiry: {} with text: '{}'", enquiryId, commentText);
        
        addComment(commentText, enquiryId);
        
        Enquiry refreshedEnquiry = enquiryGateway.getEnquiry(enquiryId);
        LOG.info("Refreshed enquiry retrieved with {} comments", 
                 refreshedEnquiry.getComments() != null ? refreshedEnquiry.getComments().size() : 0);
        
        return refreshedEnquiry;
    }
    
    /**
     * Add comment to enquiry (internal orchestration - no refresh).
     */
    private void addComment(String commentText, String enquiryId) {
        enquiryGateway.addComment(enquiryId, new Note(commentText, userProvider.getCurrentUser()));
        LOG.info("Comment added to: {}", enquiryId);
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
            // Note: updatedAt is auto-managed by Spring Boot API (JPA auditing)
            
            Enquiry updatedEnquiry = enquiryGateway.updateEnquiry(enquiry.getId().toString(), enquiry);
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
                "/enquiries/" + (enquiry.getId() != null ? enquiry.getId().toString() : "unknown"),
                "PUT"
            );
            kcontext.setVariable("errorResponse", errorResponse);
            throw new jakarta.ws.rs.WebApplicationException("EnquiryService status update error: " + e.getMessage(), e);
        }
    }
    
    /**
     * Extract enquiry from the generated process model using reflection.
     */
    private Enquiry getEnquiryFromModel(Object processModel) {
        try {
            Field enquiryField = processModel.getClass().getDeclaredField("enquiry");
            enquiryField.setAccessible(true);
            return (Enquiry) enquiryField.get(processModel);
        } catch (Exception e) {
            LOG.error("Failed to extract enquiry from process model", e);
            return null;
        }
    }
    
    /**
     * Update enquiry in the generated process model using reflection.
     */
    private void setEnquiryInModel(Object processModel, Enquiry updatedEnquiry) {
        try {
            Field enquiryField = processModel.getClass().getDeclaredField("enquiry");
            enquiryField.setAccessible(true);
            enquiryField.set(processModel, updatedEnquiry);
        } catch (Exception e) {
            LOG.error("Failed to update enquiry in process model", e);
        }
    }
}