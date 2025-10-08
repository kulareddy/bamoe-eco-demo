-- Change id column from BIGINT to UUID
-- For H2, we'll recreate the table with UUID column

-- Create a new table with UUID id
CREATE TABLE enquiries_new (
    id UUID PRIMARY KEY,
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

-- Copy data from old table to new table with generated UUIDs
INSERT INTO enquiries_new (id, title, description, type, status, reporter_name, reporter_email, 
                          assignee_name, assignee_email, resolution_notes, created_at, updated_at, resolved_at)
SELECT RANDOM_UUID(), title, description, type, status, reporter_name, reporter_email, 
       assignee_name, assignee_email, resolution_notes, created_at, updated_at, resolved_at
FROM enquiries;

-- Drop the old table
DROP TABLE enquiries;

-- Rename the new table
ALTER TABLE enquiries_new RENAME TO enquiries;

-- Recreate indexes
CREATE INDEX idx_enquiry_type ON enquiries(type);
CREATE INDEX idx_enquiry_status ON enquiries(status);
CREATE INDEX idx_enquiry_reporter_name ON enquiries(reporter_name);
CREATE INDEX idx_enquiry_reporter_email ON enquiries(reporter_email);
CREATE INDEX idx_enquiry_assignee_name ON enquiries(assignee_name);
CREATE INDEX idx_enquiry_assignee_email ON enquiries(assignee_email);
CREATE INDEX idx_enquiry_created_at ON enquiries(created_at);

-- Recreate constraints
ALTER TABLE enquiries ADD CONSTRAINT chk_enquiry_type 
    CHECK (type IN ('TECH_SUPPORT', 'BUSINESS_CASE', 'INCIDENT'));

ALTER TABLE enquiries ADD CONSTRAINT chk_enquiry_status 
    CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'));