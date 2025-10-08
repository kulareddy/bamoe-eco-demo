package com.example.bamoe.filter;

import com.example.bamoe.model.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.client.ClientRequestContext;
import jakarta.ws.rs.client.ClientResponseContext;
import jakarta.ws.rs.client.ClientResponseFilter;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

/**
 * REST client response filter for handling errors from external services
 * Converts error responses to standardized ErrorResponse format
 */
public class RestClientErrorFilter implements ClientResponseFilter {
    
    private static final Logger LOG = Logger.getLogger(RestClientErrorFilter.class);
    
    @Inject
    ObjectMapper objectMapper;
    
    @Override
    public void filter(ClientRequestContext requestContext, ClientResponseContext responseContext) throws IOException {
        // Only process error responses (4xx and 5xx)
        if (responseContext.getStatus() < 400) {
            return;
        }

        LOG.warnf("External service error: %s %s returned status %d", 
                 requestContext.getMethod(), 
                 requestContext.getUri().toString(), 
                 responseContext.getStatus());

        ErrorResponse errorResponse = createErrorResponse(requestContext, responseContext);
        
        throw new WebApplicationException(
            Response.status(responseContext.getStatus())
                .entity(errorResponse)
                .type("application/json")
                .build()
        );
    }
    
    private ErrorResponse createErrorResponse(ClientRequestContext requestContext, ClientResponseContext responseContext) {
        // Try to parse ErrorResponse or create one
        ErrorResponse errorResponse = parseErrorResponse(responseContext)
            .orElseGet(() -> buildErrorResponse(responseContext));
            
        // Set context information
        return setContextInfo(errorResponse, requestContext, responseContext);
    }
    
    private Optional<ErrorResponse> parseErrorResponse(ClientResponseContext responseContext) {
        try {
            if (responseContext.hasEntity()) {
                String responseBody = new String(responseContext.getEntityStream().readAllBytes());
                ErrorResponse parsed = objectMapper.readValue(responseBody, ErrorResponse.class);
                LOG.debugf("Parsed ErrorResponse from external service: %s", parsed.getErrorMessage());
                return Optional.of(parsed);
            }
        } catch (Exception e) {
            LOG.debugf("Failed to parse ErrorResponse from external service: %s", e.getMessage());
        }
        return Optional.empty();
    }
    
    private ErrorResponse buildErrorResponse(ClientResponseContext responseContext) {
        return new ErrorResponse(
            String.valueOf(responseContext.getStatus()),
            getErrorMessage(responseContext.getStatus()),
            "External service returned error",
            extractServiceName(responseContext),
            null, // URI will be set in setContextInfo
            null  // Method will be set in setContextInfo
        );
    }
    
    private ErrorResponse setContextInfo(ErrorResponse errorResponse, ClientRequestContext requestContext, ClientResponseContext responseContext) {
        errorResponse.setMethod(requestContext.getMethod());
        errorResponse.setUri(requestContext.getUri().toString());
        errorResponse.setResource(requestContext.getUri().getPath());
        errorResponse.setCorrelationId(getCorrelationId(requestContext));
        return errorResponse;
    }
    
    private String getCorrelationId(ClientRequestContext requestContext) {
        return Optional.ofNullable(requestContext.getHeaderString("X-Correlation-ID"))
            .or(() -> Optional.ofNullable(requestContext.getHeaderString("Correlation-ID")))
            .or(() -> Optional.ofNullable(requestContext.getHeaderString("X-Request-ID")))
            .orElseGet(() -> UUID.randomUUID().toString());
    }
    
    private String getErrorMessage(int status) {
        return switch (status) {
            case 400 -> "Bad Request";
            case 401 -> "Unauthorized";
            case 403 -> "Forbidden";
            case 404 -> "Not Found";
            case 408 -> "Request Timeout";
            case 409 -> "Conflict";
            case 422 -> "Unprocessable Entity";
            case 429 -> "Too Many Requests";
            case 500 -> "Internal Server Error";
            case 502 -> "Bad Gateway";
            case 503 -> "Service Unavailable";
            case 504 -> "Gateway Timeout";
            default -> "External Service Error";
        };
    }
    
    private String extractServiceName(ClientResponseContext responseContext) {
        // Extract service name from response headers or use default
        return responseContext.getHeaderString("X-Service-Name") != null ? 
            responseContext.getHeaderString("X-Service-Name") : 
            "external-service";
    }
}