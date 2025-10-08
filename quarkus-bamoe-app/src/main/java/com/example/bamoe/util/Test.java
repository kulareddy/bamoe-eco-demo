package com.example.bamoe.util;

import com.example.bamoe.model.Enquiry;
import com.example.bamoe.model.EnquiryType;
import com.example.bamoe.model.EnquiryStatus;

public class Test {

    public static void main(String[] args) {
        System.out.println("Hello, World!");
        Enquiry enquiry = new Enquiry();
        enquiry.setType(EnquiryType.BUSINESS_CASE);

        // Test enquiry type checks
        boolean isTechSupport = "TECH_SUPPORT".equals(enquiry.getType().name());
        boolean isIncident = "INCIDENT".equals(enquiry.getType().name());
        boolean isBusinessCase = "BUSINESS_CASE".equals(enquiry.getType().name());
        
        System.out.println("Is Tech Support: " + isTechSupport);
        System.out.println("Is Incident: " + isIncident);
        System.out.println("Is Business Case: " + isBusinessCase);

        // Test enquiry status checks
        EnquiryStatus enquiryStatus = EnquiryStatus.CLOSED;
        enquiry.setStatus(enquiryStatus);

        // enquiryStatus!=null && "RE_OPEN".equals(enquiryStatus.name())

        boolean isCompleted = "RESOLVED".equals(enquiryStatus.name()) || 
                             "CLOSED".equals(enquiryStatus.name()) || 
                             "CANCELLED".equals(enquiryStatus.name());
        boolean isInProgress = "IN_PROGRESS".equals(enquiryStatus.name());
        boolean isOpen = "OPEN".equals(enquiryStatus.name()) || "RE_OPEN".equals(enquiryStatus.name());
        
        System.out.println("Is Completed: " + isCompleted);
        System.out.println("Is In Progress: " + isInProgress);
        System.out.println("Is Open: " + isOpen);
        
        // Test all status values
        System.out.println("\nTesting all EnquiryStatus values:");
        for (EnquiryStatus status : EnquiryStatus.values()) {
            System.out.println(status.name() + " -> " + status.getDescription());
        }
        
        // Test the new RE_OPEN status
        System.out.println("\nTesting RE_OPEN status:");
        EnquiryStatus reopenStatus = EnquiryStatus.RE_OPEN;
        enquiry.setStatus(reopenStatus);
        System.out.println("Status: " + reopenStatus);
        System.out.println("Code: " + reopenStatus.getCode());
        System.out.println("Description: " + reopenStatus.getDescription());
        
        // Test fromCode method
        System.out.println("\nTesting fromCode method:");
        try {
            EnquiryStatus fromCode = EnquiryStatus.fromCode("RE_OPEN");
            System.out.println("Found status from code 'RE_OPEN': " + fromCode.getDescription());
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
