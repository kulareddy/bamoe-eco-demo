package com.example.bamoe.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.runtime.annotations.RegisterForReflection;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Simple error response structure
 */
@RegisterForReflection
public class ErrorResponse implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @JsonProperty("errorCode")
    private String errorCode;
    
    @JsonProperty("errorMessage")
    private String errorMessage;
    
    @JsonProperty("errorDescription")
    private String errorDescription;
    
    @JsonProperty("resource")
    private String resource;
    
    @JsonProperty("uri")
    private String uri;
    
    @JsonProperty("method")
    private String method;
    
    @JsonProperty("correlationId")
    private String correlationId;
    
    @JsonProperty("timestamp")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private LocalDateTime timestamp;

    public ErrorResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(String errorCode, String errorMessage, String errorDescription, 
                        String resource, String uri, String method) {
        this();
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
        this.errorDescription = errorDescription;
        this.resource = resource;
        this.uri = uri;
        this.method = method;
    }

    public ErrorResponse(String errorCode, String errorMessage, String errorDescription, 
                        String resource, String uri, String method, String correlationId) {
        this(errorCode, errorMessage, errorDescription, resource, uri, method);
        this.correlationId = correlationId;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getErrorDescription() {
        return errorDescription;
    }

    public void setErrorDescription(String errorDescription) {
        this.errorDescription = errorDescription;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ErrorResponse that = (ErrorResponse) o;
        return Objects.equals(errorCode, that.errorCode) && 
               Objects.equals(errorMessage, that.errorMessage) && 
               Objects.equals(errorDescription, that.errorDescription) && 
               Objects.equals(resource, that.resource) && 
               Objects.equals(uri, that.uri) && 
               Objects.equals(method, that.method) && 
               Objects.equals(correlationId, that.correlationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(errorCode, errorMessage, errorDescription, resource, uri, method, correlationId);
    }

    @Override
    public String toString() {
        return "ErrorResponse{" +
                "errorCode='" + errorCode + "'" +
                ", errorMessage='" + errorMessage + "'" +
                ", errorDescription='" + errorDescription + "'" +
                ", resource='" + resource + "'" +
                ", uri='" + uri + "'" +
                ", method='" + method + "'" +
                ", correlationId='" + correlationId + "'" +
                ", timestamp=" + timestamp +
                '}';
    }
}