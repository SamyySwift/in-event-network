-- Add new social media fields to speakers table
ALTER TABLE public.speakers 
ADD COLUMN instagram_link text,
ADD COLUMN tiktok_link text;

-- Update ticket quantity when tickets are purchased
CREATE OR REPLACE FUNCTION public.decrement_ticket_quantity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update available quantity for the ticket type
  UPDATE ticket_types 
  SET available_quantity = GREATEST(0, available_quantity - 1)
  WHERE id = NEW.ticket_type_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically decrement ticket quantity when ticket is created
CREATE TRIGGER trigger_decrement_ticket_quantity
  AFTER INSERT ON event_tickets
  FOR EACH ROW
  EXECUTE FUNCTION decrement_ticket_quantity();