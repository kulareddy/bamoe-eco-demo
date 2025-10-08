package com.example.springboot.model;

/**
 * Enumeration representing different types of enquiries.
 */
public enum EnquiryType {
    TECH_SUPPORT("Technical Support"),
    BUSINESS_CASE("Business Case"),
    INCIDENT("Incident");

    private final String displayName;

    EnquiryType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}