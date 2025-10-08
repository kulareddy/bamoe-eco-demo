-- Add process_instance_id column to enquiries table
ALTER TABLE enquiries ADD COLUMN process_instance_id VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN enquiries.process_instance_id IS 'Kogito process instance ID associated with this enquiry';