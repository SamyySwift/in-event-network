-- Add purchase method field to ticket_types table
ALTER TABLE ticket_types 
ADD COLUMN requires_login boolean NOT NULL DEFAULT true;

-- Add comment to clarify the field
COMMENT ON COLUMN ticket_types.requires_login IS 'If true, users must login to purchase. If false, guest purchases are allowed.';