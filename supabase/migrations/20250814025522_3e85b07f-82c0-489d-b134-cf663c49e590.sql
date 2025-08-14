-- Check current triggers on event_tickets table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'event_tickets' 
AND trigger_schema = 'public';