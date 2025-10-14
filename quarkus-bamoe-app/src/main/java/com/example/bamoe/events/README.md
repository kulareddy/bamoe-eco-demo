# Enquiry Task Event Listeners

This package contains a clean abstract factory pattern with individual implementation classes for handling enquiry task state transitions.

## Architecture

### EnquiryTaskTransitionFactory (Abstract Base Class)
Abstract factory class that provides common functionality and routing:
- **Abstract method** - `processTransition()` ensures consistent pattern
- **Map-based routing** - Routes to appropriate implementation classes
- **Common utilities** - Shared helper methods for all implementations
- **Template pattern** - Defines the flow, implementations handle specifics

### Individual Implementation Classes
Each transition has its own implementation class that extends the abstract factory:
- **HandleClaimTransition** - Handles Ready → Reserved transitions
- **HandleReleaseTransition** - Handles Reserved → Ready transitions
- **Single responsibility** - Each class handles one specific transition
- **Consistent pattern** - All implement `processTransition()` method

```java
@ApplicationScoped
public abstract class EnquiryTaskTransitionFactory implements UserTaskEventListener {
    
    // Map of transition handlers - each implementation handles one transition
    private final Map<String, EnquiryTaskTransitionFactory> transitionHandlers = Map.of(
        "Ready→Reserved", new HandleClaimTransition(),
        "Reserved→Ready", new HandleReleaseTransition()
    );
    
    // Abstract method that each implementation must provide
    public abstract boolean processTransition(UserTaskStateEvent event, ProcessInstance<?> processInstance);
}

@ApplicationScoped
public class HandleClaimTransition extends EnquiryTaskTransitionFactory {
    
    @Override
    public boolean processTransition(UserTaskStateEvent event, ProcessInstance<?> processInstance) {
        // Claim-specific logic here
        return true;
    }
}

@ApplicationScoped
public class HandleReleaseTransition extends EnquiryTaskTransitionFactory {
    
    @Override
    public boolean processTransition(UserTaskStateEvent event, ProcessInstance<?> processInstance) {
        // Release-specific logic here
        return true;
    }
}
```

## Adding New Transitions

To add support for new task state transitions, simply:

1. **Create a new implementation class** that extends `EnquiryTaskTransitionFactory`:
```java
@ApplicationScoped
public class HandleCompleteTransition extends EnquiryTaskTransitionFactory {
    
    @Inject
    EnquiryService enquiryService;
    
    @Override
    public boolean processTransition(UserTaskStateEvent event, ProcessInstance<?> processInstance) {
        LOG.info("HandleCompleteTransition: Processing complete transition (Reserved → Completed)");
        
        try {
            Enquiry enquiry = getEnquiryFromModel(processInstance.variables());
            if (enquiry == null) {
                LOG.warn("No enquiry found in process variables");
                return true;
            }
            
            // Your complete logic here
            Enquiry updatedEnquiry = enquiryService.handleTaskComplete(enquiry);
            updateProcessModel(processInstance, updatedEnquiry);
            
            return true;
        } catch (Exception e) {
            LOG.error("Error in HandleCompleteTransition.processTransition", e);
            throw e;
        }
    }
}
```

2. **Add to the Map** in `EnquiryTaskTransitionFactory`:
```java
private final Map<String, EnquiryTaskTransitionFactory> transitionHandlers = Map.of(
    "Ready→Reserved", new HandleClaimTransition(),
    "Reserved→Ready", new HandleReleaseTransition(),
    "Reserved→Completed", new HandleCompleteTransition()  // New transition
);
```

That's it! Each transition gets its own focused implementation class.

## Benefits

1. **Consistent Pattern** - All implementations use `processTransition()` method
2. **Single Responsibility** - Each class handles one specific transition
3. **Easy Extension** - Create new class + add to Map
4. **Template Pattern** - Abstract class defines flow, implementations handle specifics
5. **Modern Java** - Uses Map.of() and inheritance
6. **Easy Testing** - Each implementation can be tested independently
7. **Maintainability** - Clear separation of concerns
8. **Reusability** - Common functionality shared via abstract base class

## Current Transitions

- **Ready → Reserved** - Task claim (updates enquiry to IN_PROGRESS) - `HandleClaimTransition`
- **Reserved → Ready** - Task release (updates enquiry to OPEN) - `HandleReleaseTransition`

## Future Extensions

Easy to add new transitions:
- **Reserved → Completed** - Task completion - `HandleCompleteTransition`
- **Ready → Skipped** - Task skip - `HandleSkipTransition`
- **Reserved → Escalated** - Task escalation - `HandleEscalateTransition`
- **Reserved → Delegated** - Task delegation - `HandleDelegateTransition`
- **Any custom transition** - Create new class + add to Map!
