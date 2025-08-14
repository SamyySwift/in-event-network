-- Remove duplicate quantity decrement triggers
DROP TRIGGER IF EXISTS trigger_decrement_ticket_quantity ON event_tickets;
DROP TRIGGER IF EXISTS update_ticket_availability_trigger ON event_tickets;

-- Keep only the update_ticket_availability function which handles both INSERT and UPDATE properly
CREATE TRIGGER update_ticket_availability_trigger
    AFTER INSERT OR UPDATE ON event_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_availability();