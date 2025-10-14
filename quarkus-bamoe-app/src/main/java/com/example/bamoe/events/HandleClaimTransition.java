package com.example.bamoe.events;

import com.example.bamoe.model.Enquiry;
import com.example.bamoe.model.User;
import com.example.bamoe.service.EnquiryService;
import com.example.bamoe.filter.UserProvider;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.kie.kogito.process.ProcessInstance;
import org.kie.kogito.usertask.events.UserTaskStateEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 * Implementation class for handling claim transitions (Ready → Reserved).
 * 
 * Extends the abstract factory and implements the processTransition method
 * for claim-specific business logic.
 */
@ApplicationScoped
public class HandleClaimTransition extends EnquiryTaskTransitionFactory {
    
    private static final Logger LOG = LoggerFactory.getLogger(HandleClaimTransition.class);
    
    @Inject
    EnquiryService enquiryService;
    
    @Inject
    UserProvider userProvider;
    
    @Override
    public void processTransition(UserTaskStateEvent event, ProcessInstance<?> processInstance) {
        try {
            LOG.info("HandleClaimTransition: Processing claim transition (Ready → Reserved)");
            
            String userId = event.getUserTaskInstance().getActualOwner();
            if (userId == null || userId.isEmpty()) {
                LOG.warn("Task claimed but no actualOwner found");
                return;
            }
            
            LOG.info("Task claimed by user: {}", userId);
            
            Enquiry enquiry = getEnquiryFromModel(processInstance.variables());
            if (enquiry == null) {
                LOG.warn("No enquiry found in process variables");
                return;
            }
            
            User assignee = userProvider.getUserById(userId);
            if (assignee == null) {
                LOG.warn("User not found for ID: {}", userId);
                return;
            }
            
            Enquiry updatedEnquiry = enquiryService.handleTaskClaim(enquiry, assignee);
            if (updatedEnquiry == null) {
                LOG.warn("Failed to update enquiry in external service");
                return;
            }
            
            updateProcessModel(processInstance, updatedEnquiry);
            LOG.info("Successfully processed claim transition for enquiry: {}", enquiry.getTitle());
        } catch (Exception e) {
            LOG.error("Error in HandleClaimTransition.processTransition: {}", e.getMessage(), e);
        }
    }
    
}
