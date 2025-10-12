package com.example.bamoe.util;

import com.example.bamoe.model.Enquiry;
import com.example.bamoe.model.EnquiryStatus;
import com.example.bamoe.model.EnquiryType;


public class Test {

    public static void main(String[] args) {
        System.out.println("Hello, World!");
        Enquiry enquiry = new Enquiry();
        enquiry.setType(EnquiryType.BUSINESS_CASE);
        enquiry.getStatus().name().equals("RESOLVED");
        enquiry.getStatus().name().equals("CLOSED");
        enquiry.getStatus().name().equals("CANCELLED");
        enquiry.getStatus().name().equals("RE_OPEN");

        EnquiryStatus enquiryStatus = enquiry.getStatus();
        if (enquiryStatus == EnquiryStatus.RESOLVED) {
            System.out.println("Resolved");
        } else if (enquiryStatus == EnquiryStatus.CLOSED) {
            System.out.println("Closed");
        } else if (enquiryStatus == EnquiryStatus.CANCELLED) {
            System.out.println("Cancelled");
        } 

    }
        
        
}
