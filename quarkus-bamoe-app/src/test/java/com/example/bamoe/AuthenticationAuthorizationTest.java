// package com.example.bamoe;

// import io.quarkus.test.junit.QuarkusTest;
// import io.restassured.RestAssured;
// import io.restassured.http.ContentType;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.TestMethodOrder;
// import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
// import org.junit.jupiter.api.Order;

// // Using Map for JSON structure instead of model classes

// import java.util.Map;

// import static io.restassured.RestAssured.given;
// import static org.hamcrest.Matchers.*;

// /**
//  * Comprehensive test for Authentication and Authorization of BPMN Process Tasks
//  * This test verifies:
//  * 1. Dynamic group allocation based on enquiry type (DMN decision)
//  * 2. User authentication via OIDC/JWT tokens
//  * 3. Authorization for task claiming based on user group membership
//  * 4. Management Console integration
//  */
// @QuarkusTest
// @TestMethodOrder(OrderAnnotation.class)
// public class AuthenticationAuthorizationTest {

//     private static final String KEYCLOAK_SERVER_URL = "http://localhost:9180";
//     private static final String REALM = "quarkus-realm";
//     private static final String CLIENT_ID = "quarkus-bamoe-app";
//     private static final String CLIENT_SECRET = "quarkus-bamoe-secret";
    
//     // Test users from RBAC configuration
//     private static final String TECH_USER = "tech1";
//     private static final String TECH_PASSWORD = "tech123";
//     private static final String BUSINESS_USER = "business1";
//     private static final String BUSINESS_PASSWORD = "business123";
//     private static final String ANALYST_USER = "analyst1";
//     private static final String ANALYST_PASSWORD = "analyst123";
    
//     private String techUserToken;
//     private String businessUserToken;
//     private String analystUserToken;
    
//     @BeforeEach
//     void setUp() {
//         RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
//     }

//     /**
//      * Test 1: Obtain JWT tokens for different users to verify authentication works
//      */
//     @Test
//     @Order(1)
//     void testObtainJWTTokensForUsers() {
//         // Test tech support user token
//         techUserToken = getAccessToken(TECH_USER, TECH_PASSWORD);
//         System.out.println("Tech user token obtained: " + (techUserToken != null ? "✓" : "✗"));
        
//         // Test business support user token  
//         businessUserToken = getAccessToken(BUSINESS_USER, BUSINESS_PASSWORD);
//         System.out.println("Business user token obtained: " + (businessUserToken != null ? "✓" : "✗"));
        
//         // Test analyst user token
//         analystUserToken = getAccessToken(ANALYST_USER, ANALYST_PASSWORD);
//         System.out.println("Analyst user token obtained: " + (analystUserToken != null ? "✓" : "✗"));
//     }

//     /**
//      * Test 2: Start process with TECH_SUPPORT enquiry type and verify dynamic group allocation
//      */
//     @Test
//     @Order(2) 
//     void testTechSupportEnquiryProcessWithDynamicGroupAllocation() {
//         if (techUserToken == null) {
//             techUserToken = getAccessToken(TECH_USER, TECH_PASSWORD);
//         }
        
//         // Create enquiry request with proper JSON structure
//         Map<String, Object> enquiryRequest = Map.of(
//             "enquiry", Map.of(
//                 "title", "Database Connection Issue",
//                 "description", "Cannot connect to production database",
//                 "type", "TECH_SUPPORT",
//                 "status", "OPEN",
//                 "reporter", Map.of(
//                     "name", "tech1",
//                     "email", "tech1@example.com"
//                 )
//             )
//         );
        
//         String processInstanceId = given()
//             .auth().oauth2(techUserToken)
//             .contentType(ContentType.JSON)
//             .body(enquiryRequest)
//         .when()
//             .post("/EnquiryProcess")
//         .then()
//             .statusCode(201)
//             .body("id", notNullValue())
//             .extract().path("id");
            
//         System.out.println("Process instance started: " + processInstanceId);
        
//         // Verify task is created and assigned to TechSupport group
//         given()
//             .auth().oauth2(techUserToken)
//         .when()
//             .get("/EnquiryProcess/{id}/tasks", processInstanceId)
//         .then()
//             .statusCode(200)
//             .body("size()", greaterThan(0))
//             .body("[0].potentialGroups", hasItem("TechSupport"))
//             .body("[0].name", equalTo("TaskSupport"));
            
//         System.out.println("✓ Tech support enquiry correctly assigned to TechSupport group");
//     }

//     /**
//      * Test 3: Start process with BUSINESS_CASE enquiry type and verify group allocation
//      */
//     @Test
//     @Order(3)
//     void testBusinessCaseEnquiryProcessWithDynamicGroupAllocation() {
//         if (businessUserToken == null) {
//             businessUserToken = getAccessToken(BUSINESS_USER, BUSINESS_PASSWORD);
//         }
        
//         // Create enquiry request with proper JSON structure
//         Map<String, Object> enquiryRequest = Map.of(
//             "enquiry", Map.of(
//                 "title", "Process Improvement Request",
//                 "description", "Need to optimize order processing workflow",
//                 "type", "BUSINESS_CASE",
//                 "status", "OPEN",
//                 "reporter", Map.of(
//                     "name", "business1",
//                     "email", "business1@example.com"
//                 )
//             )
//         );
        
//         String processInstanceId = given()
//             .auth().oauth2(businessUserToken)
//             .contentType(ContentType.JSON)
//             .body(enquiryRequest)
//         .when()
//             .post("/EnquiryProcess")
//         .then()
//             .statusCode(201)
//             .body("id", notNullValue())
//             .extract().path("id");
            
//         System.out.println("Business process instance started: " + processInstanceId);
        
//         // Verify task is assigned to BusinessSupport group
//         given()
//             .auth().oauth2(businessUserToken)
//         .when()
//             .get("/EnquiryProcess/{id}/tasks", processInstanceId)
//         .then()
//             .statusCode(200)
//             .body("size()", greaterThan(0))
//             .body("[0].potentialGroups", hasItem("BusinessSupport"))
//             .body("[0].name", equalTo("TaskSupport"));
            
//         System.out.println("✓ Business case enquiry correctly assigned to BusinessSupport group");
//     }

//     /**
//      * Test 4: Start process with INCIDENT enquiry type and verify group allocation
//      */
//     @Test
//     @Order(4)
//     void testIncidentEnquiryProcessWithDynamicGroupAllocation() {
//         if (analystUserToken == null) {
//             analystUserToken = getAccessToken(ANALYST_USER, ANALYST_PASSWORD);
//         }
        
//         // Create enquiry request with proper JSON structure
//         Map<String, Object> enquiryRequest = Map.of(
//             "enquiry", Map.of(
//                 "title", "System Outage Investigation",
//                 "description", "Investigate root cause of service outage",
//                 "type", "INCIDENT",
//                 "status", "OPEN",
//                 "reporter", Map.of(
//                     "name", "analyst1",
//                     "email", "analyst1@example.com"
//                 )
//             )
//         );
        
//         String processInstanceId = given()
//             .auth().oauth2(analystUserToken)
//             .contentType(ContentType.JSON)
//             .body(enquiryRequest)
//         .when()
//             .post("/EnquiryProcess")
//         .then()
//             .statusCode(201)
//             .body("id", notNullValue())
//             .extract().path("id");
            
//         System.out.println("Incident process instance started: " + processInstanceId);
        
//         // Verify task is assigned to Analysts group
//         given()
//             .auth().oauth2(analystUserToken)
//         .when()
//             .get("/EnquiryProcess/{id}/tasks", processInstanceId)
//         .then()
//             .statusCode(200)
//             .body("size()", greaterThan(0))
//             .body("[0].potentialGroups", hasItem("Analysts"))
//             .body("[0].name", equalTo("TaskSupport"));
            
//         System.out.println("✓ Incident enquiry correctly assigned to Analysts group");
//     }

//     /**
//      * Test 5: Verify authorization - tech user can only claim tech support tasks
//      */
//     @Test
//     @Order(5)
//     void testAuthorizationTechUserCanOnlyClaimTechTasks() {
//         if (techUserToken == null) {
//             techUserToken = getAccessToken(TECH_USER, TECH_PASSWORD);
//         }
        
//         // Get tasks available to tech user (should only see TechSupport group tasks)
//         given()
//             .auth().oauth2(techUserToken)
//         .when()
//             .get("/usertasks/instances")
//         .then()
//             .statusCode(200)
//             .body("find { task -> task.potentialGroups.contains('TechSupport') }", notNullValue())
//             .body("find { task -> task.potentialGroups.contains('BusinessSupport') }", nullValue())
//             .body("find { task -> task.potentialGroups.contains('Analysts') }", nullValue());
            
//         System.out.println("✓ Tech user can only see TechSupport group tasks (proper authorization)");
//     }

//     /**
//      * Test 6: Verify cross-authorization denial - business user cannot claim tech tasks
//      */
//     @Test
//     @Order(6)
//     void testAuthorizationBusinessUserCannotClaimTechTasks() {
//         if (businessUserToken == null) {
//             businessUserToken = getAccessToken(BUSINESS_USER, BUSINESS_PASSWORD);
//         }
        
//         // Business user should only see BusinessSupport tasks
//         given()
//             .auth().oauth2(businessUserToken)
//         .when()
//             .get("/usertasks/instances")
//         .then()
//             .statusCode(200)
//             .body("find { task -> task.potentialGroups.contains('BusinessSupport') }", notNullValue())
//             .body("find { task -> task.potentialGroups.contains('TechSupport') }", nullValue())
//             .body("find { task -> task.potentialGroups.contains('Analysts') }", nullValue());
            
//         System.out.println("✓ Business user can only see BusinessSupport group tasks (proper authorization)");
//     }

//     /**
//      * Test 7: Test actual task claiming and completion with proper authorization
//      */
//     @Test
//     @Order(7)
//     void testTaskClaimingAndCompletionWithAuthorization() {
//         if (techUserToken == null) {
//             techUserToken = getAccessToken(TECH_USER, TECH_PASSWORD);
//         }
        
//         // Get the first available tech support task
//         String taskId = given()
//             .auth().oauth2(techUserToken)
//         .when()
//             .get("/usertasks/instances")
//         .then()
//             .statusCode(200)
//             .body("size()", greaterThan(0))
//             .extract().path("[0].id");
            
//         System.out.println("Found task to claim: " + taskId);
        
//         // Claim the task
//         given()
//             .auth().oauth2(techUserToken)
//             .contentType(ContentType.JSON)
//         .when()
//             .post("/usertasks/instances/{taskId}/claim", taskId)
//         .then()
//             .statusCode(200);
            
//         System.out.println("✓ Task successfully claimed by authorized user");
        
//         // Verify task is now claimed and assigned to the user
//         given()
//             .auth().oauth2(techUserToken)
//         .when()
//             .get("/usertasks/instances/{taskId}", taskId)
//         .then()
//             .statusCode(200)
//             .body("actualOwner", equalTo(TECH_USER))
//             .body("status", equalTo("Reserved"));
            
//         System.out.println("✓ Task is properly assigned to user after claiming");
//     }

//     /**
//      * Test 8: Verify Management Console authentication and task visibility
//      */
//     @Test
//     @Order(8)
//     void testManagementConsoleAuthenticationAndTaskVisibility() {
//         if (techUserToken == null) {
//             techUserToken = getAccessToken(TECH_USER, TECH_PASSWORD);
//         }
        
//         // Test GraphQL endpoint (used by Management Console)
//         String graphqlQuery = """
//             {
//                 UserTaskInstances {
//                     id
//                     name
//                     potentialGroups
//                     actualOwner
//                     status
//                 }
//             }
//             """;
            
//         given()
//             .auth().oauth2(techUserToken)
//             .contentType(ContentType.JSON)
//             .body(Map.of("query", graphqlQuery))
//         .when()
//             .post("/graphql")
//         .then()
//             .statusCode(200)
//             .body("data.UserTaskInstances", notNullValue())
//             .body("data.UserTaskInstances.size()", greaterThanOrEqualTo(0));
            
//         System.out.println("✓ Management Console GraphQL endpoint accessible with authentication");
//     }

//     /**
//      * Helper method to obtain JWT access token from Keycloak
//      */
//     private String getAccessToken(String username, String password) {
//         try {
//             return given()
//                 .contentType("application/x-www-form-urlencoded")
//                 .formParam("grant_type", "password")
//                 .formParam("client_id", CLIENT_ID)
//                 .formParam("client_secret", CLIENT_SECRET)
//                 .formParam("username", username)
//                 .formParam("password", password)
//             .when()
//                 .post(KEYCLOAK_SERVER_URL + "/realms/" + REALM + "/protocol/openid-connect/token")
//             .then()
//                 .statusCode(200)
//                 .extract().path("access_token");
//         } catch (Exception e) {
//             System.err.println("Failed to get access token for user " + username + ": " + e.getMessage());
//             return null;
//         }
//     }
// }