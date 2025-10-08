package com.example.springboot.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${server.servlet.context-path:/}")
    private String contextPath;

    @Value("#{'${openapi.servers.urls:}'.split(',')}")
    private List<String> serverUrls;

    @Value("#{'${openapi.servers.descriptions:}'.split(',')}")
    private List<String> serverDescriptions;

    @Bean
    public OpenAPI springBootOpenAPI() {
        Contact contact = new Contact()
                .email("support@example.com")
                .name("Spring Boot API Support")
                .url("https://www.example.com");

        License mitLicense = new License()
                .name("MIT License")
                .url("https://choosealicense.com/licenses/mit/");

        Info info = new Info()
                .title("Spring Boot API")
                .version("1.0")
                .contact(contact)
                .description("This API provides endpoints with RESTful services.")
                .termsOfService("https://www.example.com/terms")
                .license(mitLicense);

        // Define OAuth2 security scheme
        SecurityScheme bearerAuth = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Enter JWT Bearer token");

        // Build the context path for local development
        String contextPathSuffix = "/".equals(contextPath) ? "" : contextPath;

        OpenAPI openAPI = new OpenAPI()
                .info(info)
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", bearerAuth))
                .addSecurityItem(new SecurityRequirement()
                        .addList("bearerAuth"));

        // Always add local server as default
        String defaultLocalUrl = "http://localhost:" + serverPort + contextPathSuffix;
        openAPI.addServersItem(new Server()
                .url(defaultLocalUrl)
                .description("Local Development"));

        // Add configured servers from properties
        if (serverUrls != null && !serverUrls.isEmpty() && !serverUrls.get(0).trim().isEmpty()) {
            for (int i = 0; i < serverUrls.size(); i++) {
                String url = serverUrls.get(i).trim();
                if (!url.isEmpty()) {
                    String description = "Server " + (i + 1); // Default description
                    
                    // Use corresponding description if available
                    if (serverDescriptions != null && i < serverDescriptions.size()) {
                        String desc = serverDescriptions.get(i).trim();
                        if (!desc.isEmpty()) {
                            description = desc;
                        }
                    }
                    
                    openAPI.addServersItem(new Server()
                            .url(url + contextPathSuffix)
                            .description(description));
                }
            }
        }

        return openAPI;
    }
}