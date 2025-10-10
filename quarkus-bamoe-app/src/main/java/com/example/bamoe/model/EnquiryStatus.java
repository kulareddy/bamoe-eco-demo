package com.example.bamoe.model;

/**
 * Enum representing enquiry status values based on API specification
 */
public enum EnquiryStatus {
    
    OPEN("OPEN", "Enquiry is open"),
    IN_PROGRESS("IN_PROGRESS", "Enquiry is in progress"),
    RESOLVED("RESOLVED", "Enquiry has been resolved"),
    CLOSED("CLOSED", "Enquiry has been closed"),
    CANCELLED("CANCELLED", "Enquiry has been cancelled");
    
    private final String code;
    private final String description;
    
    EnquiryStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDescription() {
        return description;
    }
    
    @Override
    public String toString() {
        return code;
    }
    
    /**
     * Get status by code
     */
    public static EnquiryStatus fromCode(String code) {
        for (EnquiryStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown enquiry status code: " + code);
    }
}