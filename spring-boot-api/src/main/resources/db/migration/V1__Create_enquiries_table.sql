-- Create enquiries table with modern SQL features
CREATE TABLE enquiries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    reporter_name VARCHAR(100) NOT NULL,
    reporter_email VARCHAR(255) NOT NULL,
    assignee_name VARCHAR(100),
    assignee_email VARCHAR(255),
    resolution_notes VARCHAR(2000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_enquiry_type ON enquiries(type);
CREATE INDEX idx_enquiry_status ON enquiries(status);
CREATE INDEX idx_enquiry_reporter_name ON enquiries(reporter_name);
CREATE INDEX idx_enquiry_reporter_email ON enquiries(reporter_email);
CREATE INDEX idx_enquiry_assignee_name ON enquiries(assignee_name);
CREATE INDEX idx_enquiry_assignee_email ON enquiries(assignee_email);
CREATE INDEX idx_enquiry_created_at ON enquiries(created_at);

-- Add constraints
ALTER TABLE enquiries ADD CONSTRAINT chk_enquiry_type 
    CHECK (type IN ('TECH_SUPPORT', 'BUSINESS_CASE', 'INCIDENT'));

ALTER TABLE enquiries ADD CONSTRAINT chk_enquiry_status 
    CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'));

-- Add comments for documentation
COMMENT ON TABLE enquiries IS 'Enquiry management table for tech support, business cases, and incidents';
COMMENT ON COLUMN enquiries.type IS 'Type of enquiry: TECH_SUPPORT, BUSINESS_CASE, or INCIDENT';
COMMENT ON COLUMN enquiries.status IS 'Current status of the enquiry';
COMMENT ON COLUMN enquiries.reporter_name IS 'Name of the user who reported the enquiry';
COMMENT ON COLUMN enquiries.reporter_email IS 'Email of the user who reported the enquiry';
COMMENT ON COLUMN enquiries.assignee_name IS 'Name of the user assigned to handle the enquiry';
COMMENT ON COLUMN enquiries.assignee_email IS 'Email of the user assigned to handle the enquiry';
COMMENT ON COLUMN enquiries.resolution_notes IS 'Notes about how the enquiry was resolved';