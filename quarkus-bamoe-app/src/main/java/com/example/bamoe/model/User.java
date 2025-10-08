package com.example.bamoe.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

import java.io.Serializable;

/**
 * User model based on API specification
 */
public class User implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @NotBlank(message = "Name is required")
    @JsonProperty("name")
    private String name;
    
    @NotBlank(message = "Email is required")
    @JsonProperty("email")
    private String email;
    
    // Constructors
    public User() {}
    
    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    @Override
    public String toString() {
        return "User{name='" + name + "', email='" + email + "'}";
    }
}