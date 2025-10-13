package com.example.bamoe.events;

import com.example.bamoe.service.EnquiryService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.kie.kogito.internal.process.event.DefaultKogitoProcessEventListener;
import org.kie.api.event.process.*;
import org.kie.api.runtime.process.WorkflowProcessInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Task lifecycle event listener for handling enquiry task events.
 * Automatically updates enquiry status and assignee when tasks are claimed or released.
 * 
 * Registered automatically by Quarkus CDI (@ApplicationScoped).
 */
@ApplicationScoped
public class EnquiryTaskListener extends DefaultKogitoProcessEventListener {
    
    private static final Logger LOG = LoggerFactory.getLogger(EnquiryTaskListener.class);
    
    @Inject
    EnquiryService enquiryService;
    
    @Override
    public void beforeProcessStarted(ProcessStartedEvent event) {
        LOG.debug(">>> beforeProcessStarted: {}", event.getProcessInstance().getProcessId());
    }
    
    @Override
    public void afterProcessStarted(ProcessStartedEvent event) {
        LOG.debug(">>> afterProcessStarted: {}", event.getProcessInstance().getProcessId());
    }
    
    @Override
    public void beforeNodeTriggered(ProcessNodeTriggeredEvent event) {
        LOG.debug(">>> beforeNodeTriggered: {} (type: {})", 
            event.getNodeInstance().getNodeName(),
            event.getNodeInstance().getClass().getSimpleName());
    }
    
    @Override
    public void beforeNodeLeft(ProcessNodeLeftEvent event) {
        LOG.debug(">>> beforeNodeLeft: {} (type: {})", 
            event.getNodeInstance().getNodeName(),
            event.getNodeInstance().getClass().getSimpleName());
    }
    
    @Override
    public void afterNodeTriggered(ProcessNodeTriggeredEvent event) {
        LOG.debug(">>> afterNodeTriggered: {} (type: {})", 
            event.getNodeInstance().getNodeName(),
            event.getNodeInstance().getClass().getSimpleName());
            
        if (!(event.getNodeInstance() instanceof org.jbpm.workflow.instance.node.HumanTaskNodeInstance)) {
            LOG.debug(">>> Not a HumanTaskNodeInstance, skipping");
            return;
        }
        if (!(event.getProcessInstance() instanceof WorkflowProcessInstance)) {
            LOG.debug(">>> Not a WorkflowProcessInstance, skipping");
            return;
        }
        
        org.jbpm.workflow.instance.node.HumanTaskNodeInstance taskNode = 
            (org.jbpm.workflow.instance.node.HumanTaskNodeInstance) event.getNodeInstance();
        
        // Log all work item parameters for debugging
        LOG.debug(">>> WorkItem parameters: {}", taskNode.getWorkItem().getParameters());
        
        // Check if task status is "Reserved" (claimed by a user)
        String taskStatus = taskNode.getWorkItem().getParameter("Status") != null 
            ? taskNode.getWorkItem().getParameter("Status").toString() 
            : null;
        
        LOG.debug(">>> Task Status: {}", taskStatus);
        
        if (!"Reserved".equalsIgnoreCase(taskStatus)) {
            LOG.debug(">>> Task not Reserved, skipping (status: {})", taskStatus);
            return;
        }
        
        // Get the user who claimed it
        String actualOwner = taskNode.getWorkItem().getParameter("ActualOwner") != null 
            ? taskNode.getWorkItem().getParameter("ActualOwner").toString() 
            : null;
        
        LOG.debug(">>> ActualOwner: {}", actualOwner);
        
        if (actualOwner == null) {
            LOG.debug(">>> No ActualOwner, skipping");
            return;
        }
        
        LOG.info("Task claimed (Reserved): '{}' by {}", event.getNodeInstance().getNodeName(), actualOwner);
        enquiryService.handleTaskClaim((WorkflowProcessInstance) event.getProcessInstance(), actualOwner);
    }
    
    @Override
    public void afterNodeLeft(ProcessNodeLeftEvent event) {
        LOG.debug(">>> afterNodeLeft: {} (type: {})", 
            event.getNodeInstance().getNodeName(),
            event.getNodeInstance().getClass().getSimpleName());
            
        if (!(event.getNodeInstance() instanceof org.jbpm.workflow.instance.node.HumanTaskNodeInstance)) {
            LOG.debug(">>> Not a HumanTaskNodeInstance, skipping");
            return;
        }
        if (!(event.getProcessInstance() instanceof WorkflowProcessInstance)) {
            LOG.debug(">>> Not a WorkflowProcessInstance, skipping");
            return;
        }
        
        org.jbpm.workflow.instance.node.HumanTaskNodeInstance taskNode = 
            (org.jbpm.workflow.instance.node.HumanTaskNodeInstance) event.getNodeInstance();
        
        // Log all work item parameters for debugging
        LOG.debug(">>> WorkItem parameters: {}", taskNode.getWorkItem().getParameters());
        
        // Check if task status is "Ready" (released back to group pool)
        String taskStatus = taskNode.getWorkItem().getParameter("Status") != null 
            ? taskNode.getWorkItem().getParameter("Status").toString() 
            : null;
        
        LOG.debug(">>> Task Status: {}", taskStatus);
            
        if (!"Ready".equalsIgnoreCase(taskStatus)) {
            LOG.debug(">>> Task not Ready, skipping (status: {})", taskStatus);
            return;
        }
        
        LOG.info("Task released (Ready): '{}'", event.getNodeInstance().getNodeName());
        enquiryService.handleTaskRelease((WorkflowProcessInstance) event.getProcessInstance());
    }
}
