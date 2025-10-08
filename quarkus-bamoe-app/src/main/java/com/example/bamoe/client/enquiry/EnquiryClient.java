package com.example.bamoe.client.enquiry;

import com.example.bamoe.filter.RestClientErrorFilter;
import com.example.bamoe.model.*;
import io.quarkus.oidc.token.propagation.AccessTokenRequestFilter;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.annotation.RegisterProvider;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.List;

/**
 * REST client for enquiry service operations
 * Based on API specification from http://localhost:8081/api/api-docs
 */
@RegisterRestClient(configKey = "enquiry-service")
@RegisterProvider(RestClientErrorFilter.class)
@RegisterProvider(AccessTokenRequestFilter.class)
// @OidcClientFilter // Uncomment if using OIDC client filter instead of token propagation
@Path("/enquiries")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface EnquiryClient {
    
    @GET
    List<Enquiry> getAll();
    
    @POST
    Enquiry create(Enquiry enquiry);
    
    @GET
    @Path("/{id}")
    Enquiry getById(@PathParam("id") String id);
    
    @PUT
    @Path("/{id}")
    Enquiry update(@PathParam("id") String id, Enquiry enquiry);
    
    @DELETE
    @Path("/{id}")
    Response delete(@PathParam("id") String id);
    
    @PATCH
    @Path("/{id}/status")
    Enquiry updateStatus(@PathParam("id") String id, @QueryParam("status") EnquiryStatus status);
    
    @PATCH
    @Path("/{id}/resolve")
    Enquiry resolve(@PathParam("id") String id, @QueryParam("resolutionNotes") String resolutionNotes);
    
    @PATCH
    @Path("/{id}/assign")
    Enquiry assign(@PathParam("id") String id, User assignee);
    
    @GET
    @Path("/process/{processInstanceId}")
    Enquiry getByProcessInstanceId(@PathParam("processInstanceId") String processInstanceId);
    
    @GET
    @Path("/{id}/comments")
    List<Comment> getComments(@PathParam("id") String id);
    
    @POST
    @Path("/{id}/comments")
    Comment addComment(@PathParam("id") String id, Comment comment);
    
    @PUT
    @Path("/{id}/comments/{commentId}")
    Comment updateComment(@PathParam("id") String id, @PathParam("commentId") String commentId, Comment comment);
    
    @DELETE
    @Path("/{id}/comments/{commentId}")
    Response deleteComment(@PathParam("id") String id, @PathParam("commentId") String commentId);
}