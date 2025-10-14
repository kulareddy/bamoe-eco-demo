package com.example.bamoe.events;

import com.example.bamoe.model.Enquiry;
import com.example.bamoe.service.EnquiryService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.kie.kogito.process.ProcessInstance;
import org.kie.kogito.usertask.events.UserTaskStateEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 * Implementation class for handling release transitions (Reserved → Ready).
 * 
 * Extends the abstract factory and implements the processTransition method
 * for release-specific business logic.
 */
@ApplicationScoped
public class HandleReleaseTransition extends EnquiryTaskTransitionFactory {
    
    private static final Logger LOG = LoggerFactory.getLogger(HandleReleaseTransition.class);
    
    @Inject
    EnquiryService enquiryService;
    
    @Override
    public void processTransition(UserTaskStateEvent event, ProcessInstance<?> processInstance) {
        try {
            LOG.info("HandleReleaseTransition: Processing release transition (Reserved → Ready)");
            
            Enquiry enquiry = getEnquiryFromModel(processInstance.variables());
            if (enquiry == null) {
                LOG.warn("No enquiry found in process variables");
                return;
            }
            
            Enquiry updatedEnquiry = enquiryService.handleTaskRelease(enquiry);
            if (updatedEnquiry == null) {
                LOG.warn("Failed to update enquiry in external service");
                return;
            }
            
            updateProcessModel(processInstance, updatedEnquiry);
            LOG.info("Successfully processed release transition for enquiry: {}", enquiry.getTitle());
        } catch (Exception e) {
            LOG.error("Error in HandleReleaseTransition.processTransition: {}", e.getMessage(), e);
        }
    }
    
}
