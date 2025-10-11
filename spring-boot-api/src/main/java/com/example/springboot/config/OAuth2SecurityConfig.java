package com.example.springboot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)  // Enable @PreAuthorize and @PostAuthorize
@Profile("!test")  // Exclude from test profile
public class OAuth2SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:}")
    private String issuerUri;

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:}")
    private String jwkSetUri;

    // Global OAuth2 configuration
    @Value("${spring.security.oauth2.idp.type:keycloak}")
    private String idpType;

    @Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    @Autowired
    private IdProvider idProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // If security is disabled, permit all requests
        if (!securityEnabled) {
            return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authz -> authz.anyRequest().permitAll())
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()))
                .build();
        }

        // Configure OAuth2 with JWT - respects @PreAuthorize annotations
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> {
                // Public endpoints
                authz.requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                     .requestMatchers("/api/actuator/health").permitAll()
                     .requestMatchers("/h2-console/**").permitAll()
                     // All other requests require authentication
                     .anyRequest().authenticated();
            })
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .decoder(jwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            )
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()));

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder decoder;
        if (!jwkSetUri.isEmpty()) {
            // Use JWK Set URI if provided
            decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        } else if (!issuerUri.isEmpty()) {
            // Use issuer URI if provided
            decoder = NimbusJwtDecoder.withIssuerLocation(issuerUri).build();
        } else {
            throw new IllegalArgumentException(
                "Either spring.security.oauth2.resourceserver.jwt.issuer-uri or " +
                "spring.security.oauth2.resourceserver.jwt.jwk-set-uri must be configured"
            );
        }
        
        // Configure decoder to be more lenient for client credentials
        // This helps with tokens that might not have standard user claims
        decoder.setJwtValidator(jwt -> {
            // Custom validation logic can be added here if needed
            return org.springframework.security.oauth2.jwt.JwtValidators.createDefault().validate(jwt);
        });
        
        return decoder;
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(idProvider::extractGrantedAuthorities);
        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:*", "https://localhost:*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}