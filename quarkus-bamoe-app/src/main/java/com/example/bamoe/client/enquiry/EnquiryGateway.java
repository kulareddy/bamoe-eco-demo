package com.example.bamoe.client.enquiry;

import com.example.bamoe.model.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.util.List;

/**
 * Gateway service for enquiry operations
 */
@ApplicationScoped
public class EnquiryGateway {
    
    
    @Inject
    @RestClient
    EnquiryClient enquiryClient;
    
    public List<Enquiry> getAllEnquiries() {
        return enquiryClient.getAll();
    }
    
    public Enquiry createEnquiry(Enquiry enquiry) {
        return enquiryClient.create(enquiry);
    }
    
    public Enquiry getEnquiry(String id) {
        return enquiryClient.getById(id);
    }
    
    public Enquiry updateEnquiry(String id, Enquiry enquiry) {
        return enquiryClient.update(id, enquiry);
    }
    
    public Enquiry updateStatus(String id, EnquiryStatus status) {
        return enquiryClient.updateStatus(id, status);
    }
    
    public Enquiry resolveEnquiry(String id, String resolutionNotes) {
        return enquiryClient.resolve(id, resolutionNotes);
    }
    
    public Enquiry assignEnquiry(String id, User assignee) {
        return enquiryClient.assign(id, assignee);
    }
    
    public Enquiry getByProcessInstanceId(String processInstanceId) {
        return enquiryClient.getByProcessInstanceId(processInstanceId);
    }
    
    public boolean deleteEnquiry(String id) {
        Response response = enquiryClient.delete(id);
        return response.getStatus() == Response.Status.OK.getStatusCode();
    }
    
    public List<Note> getComments(String id) {
        return enquiryClient.getComments(id);
    }
    
    public Note addComment(String id, Note comment) {
        return enquiryClient.addComment(id, comment);
    }
    
    public Note updateComment(String id, String commentId, Note comment) {
        return enquiryClient.updateComment(id, commentId, comment);
    }
    
    public boolean deleteComment(String id, String commentId) {
        Response response = enquiryClient.deleteComment(id, commentId);
        return response.getStatus() == Response.Status.OK.getStatusCode();
    }
}