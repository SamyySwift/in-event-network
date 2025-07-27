-- Add max_tickets_per_user to ticket_types table
ALTER TABLE ticket_types 
ADD COLUMN max_tickets_per_user INTEGER NOT NULL DEFAULT 1;

-- Add first_name and last_name to event_tickets table
ALTER TABLE event_tickets 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Update existing tickets to split guest_name into first_name and last_name
UPDATE event_tickets 
SET 
  first_name = CASE 
    WHEN guest_name IS NOT NULL AND position(' ' in guest_name) > 0 
    THEN substring(guest_name from 1 for position(' ' in guest_name) - 1)
    ELSE guest_name
  END,
  last_name = CASE 
    WHEN guest_name IS NOT NULL AND position(' ' in guest_name) > 0 
    THEN substring(guest_name from position(' ' in guest_name) + 1)
    ELSE NULL
  END
WHERE guest_name IS NOT NULL;

-- Create trigger to automatically update available_quantity when tickets are purchased
CREATE OR REPLACE FUNCTION update_ticket_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Only decrement for completed payments
  IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') THEN
    UPDATE ticket_types 
    SET available_quantity = GREATEST(0, available_quantity - 1)
    WHERE id = NEW.ticket_type_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ticket quantity updates
DROP TRIGGER IF EXISTS update_ticket_availability_trigger ON event_tickets;
CREATE TRIGGER update_ticket_availability_trigger
  AFTER INSERT OR UPDATE ON event_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_availability();