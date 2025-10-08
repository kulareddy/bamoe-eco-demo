package com.example.springboot.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;

/**
 * Flyway configuration for database migrations
 * This class provides custom Flyway configuration that adapts to different environments
 */
@Configuration
public class FlywayConfig {

    @Value("${spring.flyway.locations:classpath:db/migration}")
    private String[] locations;

    @Value("${spring.flyway.baseline-version:1}")
    private String baselineVersion;

    /**
     * Configure Flyway with environment-specific settings
     * - Production: Strict settings with clean disabled
     * - Dev/Test: More flexible settings with clean enabled
     */
    @Bean
    public Flyway flyway(DataSource dataSource, Environment environment) {
        boolean isProduction = environment.matchesProfiles("prod");
        
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations(locations)
                .baselineOnMigrate(true)
                .baselineVersion(baselineVersion)
                .validateOnMigrate(true)
                .cleanDisabled(isProduction) // Disable clean only in production
                .outOfOrder(!isProduction) // Allow out of order only in non-production
                .load();
        
        flyway.migrate();
        return flyway;
    }

    /**
     * FlywayMigrationInitializer bean for Spring Boot compatibility
     */
    @Bean
    public FlywayMigrationInitializer flywayInitializer(Flyway flyway) {
        return new FlywayMigrationInitializer(flyway);
    }
}