-- Make admin_id nullable in check_ins table for public check-ins
ALTER TABLE check_ins ALTER COLUMN admin_id DROP NOT NULL;

-- Update the public check-in function to handle admin_id properly
CREATE OR REPLACE FUNCTION public.checkin_ticket_public(
  target_event_id uuid,
  search_query text,
  notes_text text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ticket_record record;
  result json;
BEGIN
  -- Find the ticket by either ticket number or attendee name
  IF search_query LIKE 'TKT-%' THEN
    -- Search by ticket number
    SELECT et.*, p.name as profile_name, p.email as profile_email
    INTO ticket_record
    FROM event_tickets et
    LEFT JOIN profiles p ON et.user_id = p.id
    WHERE et.event_id = target_event_id 
    AND et.ticket_number = search_query;
  ELSE
    -- Search by guest name or profile name
    SELECT et.*, p.name as profile_name, p.email as profile_email
    INTO ticket_record
    FROM event_tickets et
    LEFT JOIN profiles p ON et.user_id = p.id
    WHERE et.event_id = target_event_id 
    AND (
      et.guest_name ILIKE '%' || search_query || '%' OR
      p.name ILIKE '%' || search_query || '%'
    )
    LIMIT 1;
  END IF;

  -- Check if ticket was found
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'No ticket found matching search criteria');
  END IF;

  -- Check if already checked in
  IF ticket_record.check_in_status THEN
    RETURN json_build_object('success', false, 'message', 'Ticket already checked in');
  END IF;

  -- Update ticket status
  UPDATE event_tickets 
  SET 
    check_in_status = true,
    checked_in_at = now()
  WHERE id = ticket_record.id;

  -- Create check-in record with NULL admin_id for public check-ins
  INSERT INTO check_ins (ticket_id, admin_id, check_in_method, notes)
  VALUES (ticket_record.id, NULL, 'public_link', notes_text);

  -- Grant attendee dashboard access if user has an account
  IF ticket_record.user_id IS NOT NULL THEN
    PERFORM grant_attendee_dashboard_access(ticket_record.user_id, target_event_id);
  END IF;

  RETURN json_build_object(
    'success', true, 
    'message', 'Ticket checked in successfully',
    'ticket', json_build_object(
      'ticket_number', ticket_record.ticket_number,
      'attendee_name', COALESCE(ticket_record.guest_name, ticket_record.profile_name, 'N/A')
    )
  );
END;
$$;