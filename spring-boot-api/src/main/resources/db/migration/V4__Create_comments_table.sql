-- Create comments table for enquiry comments
CREATE TABLE comments (
    id UUID PRIMARY KEY,
    comment VARCHAR(2000) NOT NULL,
    commented_by_name VARCHAR(100) NOT NULL,
    commented_by_email VARCHAR(255) NOT NULL,
    commented_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    enquiry_id UUID NOT NULL,
    FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_comment_enquiry_id ON comments(enquiry_id);
CREATE INDEX idx_comment_commented_at ON comments(commented_at);
CREATE INDEX idx_comment_commented_by_email ON comments(commented_by_email);

-- Add comments for documentation
COMMENT ON TABLE comments IS 'Comments made on enquiries';
COMMENT ON COLUMN comments.comment IS 'The comment text';
COMMENT ON COLUMN comments.commented_by_name IS 'Name of the user who made the comment';
COMMENT ON COLUMN comments.commented_by_email IS 'Email of the user who made the comment';
COMMENT ON COLUMN comments.commented_at IS 'When the comment was made';
COMMENT ON COLUMN comments.enquiry_id IS 'Reference to the enquiry this comment belongs to';