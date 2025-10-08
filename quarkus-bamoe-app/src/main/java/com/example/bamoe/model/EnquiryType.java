package com.example.bamoe.model;

/**
 * Enquiry type enum based on API specification
 */
public enum EnquiryType {
    
    TECH_SUPPORT("TECH_SUPPORT", "Technical Support"),
    BUSINESS_CASE("BUSINESS_CASE", "Business Case"),
    INCIDENT("INCIDENT", "Incident");
    
    private final String code;
    private final String description;
    
    EnquiryType(String code, String description) {
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
     * Get type by code
     */
    public static EnquiryType fromCode(String code) {
        for (EnquiryType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown enquiry type code: " + code);
    }
}