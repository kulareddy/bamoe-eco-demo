package com.example.springboot.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import jakarta.annotation.PostConstruct;

/**
 * Configuration class to load environment variables from .env file.
 * This allows the application to use .env files for local development
 * while still supporting system environment variables for production.
 * Only active for default profile (./mvnw spring-boot:run).
 */
@Configuration
@Profile("default")
public class DotEnvConfig {

    private static final Logger logger = LoggerFactory.getLogger(DotEnvConfig.class);

    @PostConstruct
    public void loadDotEnv() {
        try {
            // Load .env file from project root
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")
                    .ignoreIfMalformed()
                    .ignoreIfMissing()
                    .load();

            // Set system properties for each environment variable
            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();
                
                // Only set if not already set as system property
                if (System.getProperty(key) == null) {
                    System.setProperty(key, value);
                    logger.debug("Loaded from .env: {}={}", key, value);
                } else {
                    logger.debug("Skipped .env value for {} (already set as system property)", key);
                }
            });

            logger.info("Successfully loaded .env file with {} variables", dotenv.entries().size());
            
        } catch (DotenvException e) {
            logger.warn("Could not load .env file: {}", e.getMessage());
            logger.debug("This is normal if no .env file exists or if running in production");
        }
    }
}