package com.example.springboot.config;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;

public interface IdProvider {
    Collection<GrantedAuthority> extractGrantedAuthorities(Jwt jwt);
}