package com.example.bamoe.events;

import com.example.bamoe.model.Enquiry;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import org.kie.kogito.process.Process;
import org.kie.kogito.process.ProcessInstance;
import org.kie.kogito.usertask.UserTaskEventListener;
import org.kie.kogito.usertask.events.UserTaskStateEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Field;
import java.util.Map;

/**
 * Abstract factory for handling enquiry task transitions.
 * 
 * Provides a common pattern for transition handling with individual implementation classes.
 * Each implementation class extends this abstract factory and handles one specific transition.
 */
@ApplicationScoped
public abstract class EnquiryTaskTransitionFactory implements UserTaskEventListener {
    
    private static final Logger LOG = LoggerFactory.getLogger(EnquiryTaskTransitionFactory.class);
    
    @Inject
    @Named("EnquiryProcess")
    Process<?> enquiryProcess;
    
    @Inject
    HandleClaimTransition handleClaimTransition;
    
    @Inject
    HandleReleaseTransition handleReleaseTransition;
    
    // Map of transition handlers - each implementation handles one transition
    private Map<String, EnquiryTaskTransitionFactory> transitionHandlers;
    
    /**
     * Abstract method that each implementation must provide.
     * This ensures a consistent pattern across all transition handlers.
     */
    public abstract void processTransition(UserTaskStateEvent event, ProcessInstance<?> processInstance);
    
    @PostConstruct
    void initializeHandlers() {
        transitionHandlers = Map.of(
            "Ready→Reserved", handleClaimTransition,
            "Reserved→Ready", handleReleaseTransition
        );
    }
    
    @Override
    public void onUserTaskState(UserTaskStateEvent event) {
        String oldState = event.getOldStatus() != null ? event.getOldStatus().getName() : null;
        String newState = event.getNewStatus() != null ? event.getNewStatus().getName() : null;
        String transitionKey = oldState + "→" + newState;
        
        // Only handle transitions we care about
        if (!transitionHandlers.containsKey(transitionKey)) {
            LOG.debug("Ignoring irrelevant transition: '{}'", transitionKey);
            return;
        }
        
        LOG.info("EnquiryTaskTransitionFactory: Task state change detected - Task ID: {}, Old: {}, New: {}", 
                event.getUserTaskInstance().getId(), 
                event.getOldStatus(), 
                event.getNewStatus());
        
        LOG.debug("Processing relevant transition: '{}'", transitionKey);
        
        try {
            // Get handler from map and execute
            EnquiryTaskTransitionFactory handler = transitionHandlers.get(transitionKey);
            
            if (handler != null) {
                try {
                    // Only get process instance when we actually need it
                    ProcessInstance<?> processInstance = getProcessInstanceFromTaskInput(event);
                    handler.processTransition(event, processInstance);
                    LOG.info("Successfully handled transition: {}", transitionKey);
                } catch (Exception handlerException) {
                    LOG.error("Error in transition handler for {}: {}", transitionKey, handlerException.getMessage(), handlerException);
                    // Don't re-throw - let the process continue
                }
            }
        } catch (Exception e) {
            LOG.error("EnquiryTaskTransitionFactory: Error processing task state change for transition {}: {}", 
                     transitionKey, e.getMessage(), e);
            // Don't re-throw - let the process continue
        }
    }
    
    // Helper method for getting process instance from task input
    private ProcessInstance<?> getProcessInstanceFromTaskInput(UserTaskStateEvent event) {
        var inputs = event.getUserTaskInstance().getInputs();
        if (inputs == null || inputs.isEmpty()) {
            throw new IllegalStateException("No task inputs available");
        }
        
        Enquiry enquiry = (Enquiry) inputs.get("enquiry");
        if (enquiry == null) {
            throw new IllegalStateException("No enquiry found in task inputs");
        }
        
        String processInstanceId = enquiry.getProcessInstanceId();
        if (processInstanceId == null || processInstanceId.isEmpty()) {
            throw new IllegalStateException("No process instance ID found in enquiry");
        }
        
        LOG.debug("Looking for process instance with ID: {}", processInstanceId);
        
        var processInstance = enquiryProcess.instances().findById(processInstanceId);
        if (processInstance.isEmpty()) {
            throw new IllegalStateException("Process instance not found: " + processInstanceId);
        }
        
        LOG.debug("Found process instance: {}", processInstanceId);
        return (ProcessInstance<?>) processInstance.get();
    }
    
    // Common helper methods for all implementations
    protected Enquiry getEnquiryFromModel(Object processModel) {
        try {
            if (processModel == null) {
                LOG.warn("Process model is null");
                return null;
            }
            
            Field enquiryField = processModel.getClass().getDeclaredField("enquiry");
            enquiryField.setAccessible(true);
            Enquiry enquiry = (Enquiry) enquiryField.get(processModel);
            
            if (enquiry == null) {
                LOG.warn("Enquiry field is null in process model");
            }
            
            return enquiry;
        } catch (NoSuchFieldException e) {
            LOG.error("Enquiry field not found in process model class: {}", processModel.getClass().getName(), e);
            return null;
        } catch (IllegalAccessException e) {
            LOG.error("Failed to access enquiry field in process model", e);
            return null;
        } catch (Exception e) {
            LOG.error("Unexpected error extracting enquiry from process model: {}", e.getMessage(), e);
            return null;
        }
    }
    
    protected void updateProcessModel(ProcessInstance<?> processInstance, Enquiry updatedEnquiry) {
        if (updatedEnquiry == null) {
            LOG.warn("Cannot update process model with null enquiry");
            return;
        }
        
        try {
            setEnquiryInModel(processInstance.variables(), updatedEnquiry);
            updateProcessInstance(processInstance, processInstance.variables());
        } catch (Exception e) {
            LOG.error("Failed to update process model with enquiry: {}", e.getMessage(), e);
        }
    }
    
    private void setEnquiryInModel(Object processModel, Enquiry updatedEnquiry) {
        try {
            if (processModel == null) {
                LOG.warn("Cannot set enquiry in null process model");
                return;
            }
            
            Field enquiryField = processModel.getClass().getDeclaredField("enquiry");
            enquiryField.setAccessible(true);
            enquiryField.set(processModel, updatedEnquiry);
            LOG.debug("Successfully updated enquiry in process model");
        } catch (NoSuchFieldException e) {
            LOG.error("Enquiry field not found in process model class: {}", processModel.getClass().getName(), e);
        } catch (IllegalAccessException e) {
            LOG.error("Failed to access enquiry field in process model", e);
        } catch (Exception e) {
            LOG.error("Unexpected error setting enquiry in process model: {}", e.getMessage(), e);
        }
    }
    
    @SuppressWarnings({"rawtypes", "unchecked"})
    private void updateProcessInstance(ProcessInstance<?> processInstance, Object processModel) {
        try {
            if (processInstance == null) {
                LOG.warn("Cannot update null process instance");
                return;
            }
            
            ProcessInstance rawProcessInstance = (ProcessInstance) processInstance;
            rawProcessInstance.updateVariables(processModel);
            LOG.debug("Successfully updated process instance with enquiry changes");
        } catch (Exception e) {
            LOG.error("Failed to update process instance variables: {}", e.getMessage(), e);
            throw e; // Re-throw as this is critical for process state
        }
    }
    
}
