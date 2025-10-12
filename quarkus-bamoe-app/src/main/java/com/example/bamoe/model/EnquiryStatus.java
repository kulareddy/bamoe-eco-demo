package com.example.bamoe.model;

/**
 * Enumeration representing the status of an enquiry.
 */
public enum EnquiryStatus {
    OPEN("Open"),
    IN_PROGRESS("In Progress"),
    RESOLVED("Resolved"),
    CLOSED("Closed"),
    CANCELLED("Cancelled");

    private final String displayName;

    EnquiryStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
