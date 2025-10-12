-- V1: Initial schema with Users, Enquiries, and Comments tables

-- =============================================================================
-- USERS TABLE
-- =============================================================================
CREATE TABLE users (
    user_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users table
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_name ON users(name);

-- =============================================================================
-- ENQUIRIES TABLE
-- =============================================================================
CREATE TABLE enquiries (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    reporter_user_id VARCHAR(100) NOT NULL,
    assignee_user_id VARCHAR(100),
    resolution_notes VARCHAR(2000),
    process_instance_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    CONSTRAINT fk_enquiry_reporter FOREIGN KEY (reporter_user_id) REFERENCES users(user_id),
    CONSTRAINT fk_enquiry_assignee FOREIGN KEY (assignee_user_id) REFERENCES users(user_id)
);

-- Indexes for enquiries table
CREATE INDEX idx_enquiry_type ON enquiries(type);
CREATE INDEX idx_enquiry_status ON enquiries(status);
CREATE INDEX idx_enquiry_reporter ON enquiries(reporter_user_id);
CREATE INDEX idx_enquiry_assignee ON enquiries(assignee_user_id);
CREATE INDEX idx_enquiry_created_at ON enquiries(created_at);

-- Constraints for enquiries table
ALTER TABLE enquiries ADD CONSTRAINT chk_enquiry_type 
    CHECK (type IN ('TECH_SUPPORT', 'BUSINESS_CASE', 'INCIDENT'));

ALTER TABLE enquiries ADD CONSTRAINT chk_enquiry_status 
    CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'));

-- =============================================================================
-- COMMENTS TABLE
-- =============================================================================
CREATE TABLE comments (
    id UUID PRIMARY KEY,
    comment VARCHAR(2000) NOT NULL,
    commented_by_user_id VARCHAR(100) NOT NULL,
    commented_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    enquiry_id UUID NOT NULL,
    CONSTRAINT fk_comment_user FOREIGN KEY (commented_by_user_id) REFERENCES users(user_id),
    CONSTRAINT fk_comment_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE
);

-- Indexes for comments table
CREATE INDEX idx_comment_enquiry_id ON comments(enquiry_id);
CREATE INDEX idx_comment_commented_at ON comments(commented_at);
CREATE INDEX idx_comment_user ON comments(commented_by_user_id);

