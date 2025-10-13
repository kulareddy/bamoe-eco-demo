package com.example.bamoe.events;

import com.example.bamoe.service.EnquiryService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import org.kie.kogito.process.Process;
import org.kie.kogito.internal.process.runtime.KogitoWorkflowProcessInstance;
import org.kie.kogito.usertask.UserTaskEventListener;
import org.kie.kogito.usertask.events.UserTaskStateEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * User task lifecycle event listener for handling enquiry task events.
 * Automatically updates enquiry status and assignee when tasks are claimed or released.
 * 
 * Uses Kogito-native APIs:
 * - org.kie.kogito.usertask.UserTaskEventListener for task lifecycle events
 * - org.kie.kogito.internal.process.runtime.KogitoWorkflowProcessInstance for process access
 * 
 * Registered automatically by Quarkus CDI (@ApplicationScoped).
 * 
 * State-Based Detection:
 * - Ready → Reserved: Task claimed by user
 * - Reserved → Ready: Task released back to group pool
 * 
 * Reference: BAMOE 9.3 Kogito Internal API
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
     * Called when task state changes (e.g., Ready -> Reserved, Reserved -> Ready).
     * This is the PRIMARY and ONLY event handler - state changes are reliable for detecting
     * both claims and releases, unlike assignment events which don't fire consistently.
     */
    @Override
    public void onUserTaskState(UserTaskStateEvent event) {
        LOG.info(">>> onUserTaskState: Task '{}', OldState: {}, NewState: {}", 
            event.getUserTaskInstance().getTaskName(),
            event.getOldStatus(),
            event.getNewStatus());
        
        String oldState = event.getOldStatus() != null ? event.getOldStatus().getName() : null;
        String newState = event.getNewStatus() != null ? event.getNewStatus().getName() : null;
        
        // Check if this is a state transition we care about BEFORE looking up the process
        boolean isClaim = "Ready".equals(oldState) && "Reserved".equals(newState);
        boolean isRelease = "Reserved".equals(oldState) && "Ready".equals(newState);
        
        if (!isClaim && !isRelease) {
            LOG.debug(">>> Ignoring state transition: {} → {} (not claim or release)", oldState, newState);
            return;
        }
        
        try {
            String processInstanceId = event.getUserTaskInstance().getExternalReferenceId();
            if (processInstanceId == null || processInstanceId.isEmpty()) {
                LOG.warn(">>> No process instance ID for state change: {} → {}", oldState, newState);
                return;
            }
            
            // Look up the process instance (only executed for claim/release)
            KogitoWorkflowProcessInstance kogitoInstance = (KogitoWorkflowProcessInstance) enquiryProcess.instances()
                .findById(processInstanceId)
                .orElse(null);
            
            if (kogitoInstance == null) {
                LOG.debug(">>> Process instance not found: {} (might be during initialization)", processInstanceId);
                return;
            }
            
            // Handle task CLAIM
            if (isClaim) {
                String userId = event.getUserTaskInstance().getActualOwner();
                if (userId != null && !userId.isEmpty()) {
                    LOG.info(">>> Detected task CLAIM via state change by user: {}", userId);
                    enquiryService.handleTaskClaim(kogitoInstance, userId);
                } else {
                    LOG.warn(">>> Task claimed but no actualOwner found");
                }
            }
            // Handle task RELEASE
            else if (isRelease) {
                LOG.info(">>> Detected task RELEASE via state change");
                enquiryService.handleTaskRelease(kogitoInstance);
            }
            
        } catch (Exception e) {
            LOG.error("Error handling task state change: {} → {}", oldState, newState, e);
        }
    }
}
