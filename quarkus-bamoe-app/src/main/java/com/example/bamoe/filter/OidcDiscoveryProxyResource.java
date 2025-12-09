// package com.example.bamoe.filter;

// import jakarta.enterprise.context.ApplicationScoped;
// import jakarta.ws.rs.GET;
// import jakarta.ws.rs.Path;
// import jakarta.ws.rs.Produces;
// import jakarta.ws.rs.core.MediaType;
// import jakarta.ws.rs.core.Response;

// import org.eclipse.microprofile.config.inject.ConfigProperty;

// import io.smallrye.mutiny.Uni;

// /**
//  * OIDC Discovery Proxy Resource
//  * 
//  * This resource provides OIDC discovery endpoints that proxy requests to the actual
//  * Keycloak OIDC provider. This allows external consumers (like BAMOE Management Console)
//  * to discover OIDC configuration through this service instead of directly from Keycloak.
//  * 
//  * The Management Console expects to find OIDC discovery at:
//  * http://localhost:8080/q/oidc/.well-known/openid-configuration
//  * 
//  * This endpoint proxies to the actual Keycloak endpoint:
//  * http://localhost:9180/realms/quarkus-realm/.well-known/openid-configuration
//  */
// @Path("/q/oidc/.well-known")
// @ApplicationScoped
// public class OidcDiscoveryProxyResource {

//     @ConfigProperty(name = "quarkus.oidc.auth-server-url")
//     String authServerUrl;

//     @GET
//     @Path("/openid-configuration")
//     @Produces(MediaType.APPLICATION_JSON)
//     public Uni<Response> getOpenIdConfiguration() {
//         // Construct the actual Keycloak discovery URL
//         String keycloakDiscoveryUrl = authServerUrl + "/.well-known/openid-configuration";
        
//         // For now, return a simple redirect to the actual Keycloak endpoint
//         // In a production scenario, you might want to fetch and potentially modify the response
//         return Uni.createFrom().item(
//             Response.status(Response.Status.TEMPORARY_REDIRECT)
//                 .header("Location", keycloakDiscoveryUrl)
//                 .build()
//         );
//     }

//     @GET
//     @Path("/openid-configuration-direct")
//     @Produces(MediaType.APPLICATION_JSON)
//     public Response getOpenIdConfigurationDirect() {
//         // Alternative approach: Return the Keycloak configuration directly as JSON
//         String jsonResponse = String.format("""
//             {
//                 "issuer": "%s",
//                 "authorization_endpoint": "%s/protocol/openid-connect/auth",
//                 "token_endpoint": "%s/protocol/openid-connect/token",
//                 "userinfo_endpoint": "%s/protocol/openid-connect/userinfo",
//                 "jwks_uri": "%s/protocol/openid-connect/certs",
//                 "end_session_endpoint": "%s/protocol/openid-connect/logout",
//                 "introspection_endpoint": "%s/protocol/openid-connect/token/introspect",
//                 "response_types_supported": ["code", "token", "id_token"],
//                 "grant_types_supported": ["authorization_code", "refresh_token", "client_credentials"],
//                 "subject_types_supported": ["public"],
//                 "id_token_signing_alg_values_supported": ["RS256"],
//                 "scopes_supported": ["openid", "email", "profile"],
//                 "claims_supported": ["sub", "iss", "auth_time", "name", "given_name", "family_name", "preferred_username", "email"]
//             }
//             """, authServerUrl, authServerUrl, authServerUrl, authServerUrl, authServerUrl, authServerUrl, authServerUrl);
        
//         return Response.ok(jsonResponse)
//             .header("Content-Type", MediaType.APPLICATION_JSON)
//             .build();
//     }
// }

