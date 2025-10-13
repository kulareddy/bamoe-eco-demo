package com.example.bamoe.events;

import com.example.bamoe.model.Enquiry;
import com.example.bamoe.service.EnquiryService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import org.kie.kogito.process.Process;
import org.kie.kogito.process.ProcessInstance;
import org.kie.kogito.usertask.UserTaskEventListener;
import org.kie.kogito.usertask.events.UserTaskStateEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 * Clean, functional task lifecycle listener for enquiry tasks.
 * 
 * Uses task input variables to get the correct process instance ID from the enquiry object,
 * eliminating ID mismatch issues and providing direct, reliable process instance access.
 * 
 * State transitions: Ready → Reserved (claim), Reserved → Ready (release)
 */
@ApplicationScoped
public class EnquiryTaskListener implements UserTaskEventListener {
    
    private static final Logger LOG = LoggerFactory.getLogger(EnquiryTaskListener.class);
    
    @Inject
    EnquiryService enquiryService;
    
    @Inject
    @Named("EnquiryProcess")
    Process<?> enquiryProcess;  // Must use wildcard - CDI doesn't match concrete generic types
    
    /**
     * Handles task state changes using functional programming approach.
     */
    @Override
    public void onUserTaskState(UserTaskStateEvent event) {
        LOG.info("EnquiryTaskListener: Task state change detected - Task ID: {}, Old: {}, New: {}", 
                event.getUserTaskInstance().getId(), 
                event.getOldStatus(), 
                event.getNewStatus());
        
        if (!isRelevantStateTransition(event)) {
            LOG.debug("EnquiryTaskListener: Not a relevant state transition, ignoring");
            return;
        }
        
        LOG.info("EnquiryTaskListener: Processing relevant state transition...");
        try {
            ProcessInstance<?> processInstance = getProcessInstanceFromTaskInput(event);
            handleTaskStateChange(event, processInstance);
        } catch (Exception e) {
            LOG.error("EnquiryTaskListener: Error processing task state change", e);
        }
    }
    
    private boolean isRelevantStateTransition(UserTaskStateEvent event) {
        String oldState = getStateName(event.getOldStatus());
        String newState = getStateName(event.getNewStatus());
        
        LOG.debug("State transition: '{}' → '{}'", oldState, newState);
        
        boolean isRelevant = ("Ready".equals(oldState) && "Reserved".equals(newState)) ||
                           ("Reserved".equals(oldState) && "Ready".equals(newState));
        
        if (isRelevant) {
            LOG.info("Relevant state transition detected: {} → {}", oldState, newState);
        } else {
            LOG.debug("Ignoring state transition: {} → {}", oldState, newState);
        }
        
        return isRelevant;
    }
    
    private String getStateName(Object state) {
        if (state == null) return null;
        
        String stateStr = state.toString();
        // Extract state name from UserTaskState [terminate=null, name=Ready] format
        if (stateStr.contains("name=")) {
            int start = stateStr.indexOf("name=") + 5;
            int end = stateStr.indexOf("]", start);
            if (end == -1) end = stateStr.indexOf(",", start);
            if (end == -1) end = stateStr.length();
            return stateStr.substring(start, end).trim();
        }
        
        return stateStr;
    }
    
    private ProcessInstance<?> getProcessInstanceFromTaskInput(UserTaskStateEvent event) {
        LOG.debug("Getting process instance from task input...");
        
        var inputs = event.getUserTaskInstance().getInputs();
        LOG.debug("Task inputs: {}", inputs);
        
        Enquiry enquiry = (Enquiry) inputs.get("enquiry");
        if (enquiry == null) {
            LOG.warn("No enquiry found in task inputs");
            throw new IllegalStateException("No enquiry found in task inputs");
        }
        
        String processInstanceId = enquiry.getProcessInstanceId();
        LOG.debug("Looking for process instance with ID: {}", processInstanceId);
        
        var processInstance = enquiryProcess.instances().findById(processInstanceId);
        if (processInstance.isEmpty()) {
            LOG.warn("Process instance not found: {}", processInstanceId);
            throw new IllegalStateException("Process instance not found: " + processInstanceId);
        }
        
        LOG.debug("Found process instance: {}", processInstanceId);
        return (ProcessInstance<?>) processInstance.get();
    }
    
    private void handleTaskStateChange(UserTaskStateEvent event, ProcessInstance<?> processInstance) {
        try {
            String oldState = getStateName(event.getOldStatus());
            String newState = getStateName(event.getNewStatus());
            
            LOG.info("Task state change: {} -> {}", oldState, newState);
            
            // Only handle the enquiry status updates, not the actual task claiming/releasing
            // The UI will handle the task transitions
            if ("Ready".equals(oldState) && "Reserved".equals(newState)) {
                handleTaskClaim(event, processInstance);
            } else if ("Reserved".equals(oldState) && "Ready".equals(newState)) {
                handleTaskRelease(processInstance);
            }
        } catch (Exception e) {
            LOG.error("Error in handleTaskStateChange", e);
            throw e; // Re-throw to see the full stack trace
        }
    }
    
    private void handleTaskClaim(UserTaskStateEvent event, ProcessInstance<?> processInstance) {
        try {
            String userId = event.getUserTaskInstance().getActualOwner();
            if (userId != null && !userId.isEmpty()) {
                LOG.info("Task claimed by user: {}", userId);
                enquiryService.handleTaskClaim(processInstance, userId);
            } else {
                LOG.warn("Task claimed but no actualOwner found");
            }
        } catch (Exception e) {
            LOG.error("Error in handleTaskClaim", e);
            throw e; // Re-throw to see the full stack trace
        }
    }
    
    private void handleTaskRelease(ProcessInstance<?> processInstance) {
        try {
            LOG.info("Task released");
            enquiryService.handleTaskRelease(processInstance);
        } catch (Exception e) {
            LOG.error("Error in handleTaskRelease", e);
            throw e; // Re-throw to see the full stack trace
        }
    }
}
