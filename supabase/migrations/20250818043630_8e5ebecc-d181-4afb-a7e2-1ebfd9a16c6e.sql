-- Create a public function for shareable check-in links that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_event_tickets_for_checkin(target_event_id uuid)
RETURNS TABLE(
  id uuid,
  ticket_number varchar,
  guest_name text,
  guest_email text,
  user_id uuid,
  price integer,
  check_in_status boolean,
  checked_in_at timestamp with time zone,
  purchase_date timestamp with time zone,
  ticket_type_name text,
  profile_name text,
  profile_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    et.id,
    et.ticket_number,
    et.guest_name,
    et.guest_email,
    et.user_id,
    et.price,
    et.check_in_status,
    et.checked_in_at,
    et.purchase_date,
    tt.name as ticket_type_name,
    p.name as profile_name,
    p.email as profile_email
  FROM event_tickets et
  LEFT JOIN ticket_types tt ON et.ticket_type_id = tt.id
  LEFT JOIN profiles p ON et.user_id = p.id
  WHERE et.event_id = target_event_id
  ORDER BY et.created_at DESC;
END;
$$;

-- Create a public function for check-in operations without authentication
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

  -- Create check-in record (without admin_id since this is public)
  INSERT INTO check_ins (ticket_id, check_in_method, notes)
  VALUES (ticket_record.id, 'public_link', notes_text);

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

-- Create a public function for QR code check-in
CREATE OR REPLACE FUNCTION public.checkin_ticket_by_qr_public(
  target_event_id uuid,
  qr_data text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ticket_number text;
  json_data json;
BEGIN
  -- Extract ticket number from QR data
  IF qr_data LIKE 'TKT-%' THEN
    ticket_number := qr_data;
  ELSIF qr_data LIKE '%ticket_number=%' THEN
    -- Extract from URL parameter
    ticket_number := substring(qr_data from 'ticket_number=([^&]+)');
  ELSE
    -- Try to parse as JSON
    BEGIN
      json_data := qr_data::json;
      ticket_number := COALESCE(json_data->>'ticketNumber', json_data->>'ticket_number');
    EXCEPTION WHEN others THEN
      ticket_number := qr_data; -- Use as-is if parsing fails
    END;
  END IF;

  IF ticket_number IS NULL OR ticket_number = '' THEN
    RETURN json_build_object('success', false, 'message', 'Invalid QR code format. Could not extract ticket number.');
  END IF;

  -- Use the existing check-in function
  RETURN checkin_ticket_public(target_event_id, ticket_number, 'QR code scan');
END;
$$;

-- Create a public function to get event stats for check-in
CREATE OR REPLACE FUNCTION public.get_event_checkin_stats(target_event_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_tickets integer;
  checked_in_tickets integer;
  result json;
BEGIN
  SELECT COUNT(*) INTO total_tickets
  FROM event_tickets
  WHERE event_id = target_event_id;

  SELECT COUNT(*) INTO checked_in_tickets
  FROM event_tickets
  WHERE event_id = target_event_id AND check_in_status = true;

  RETURN json_build_object(
    'totalTickets', total_tickets,
    'checkedInTickets', checked_in_tickets,
    'pendingTickets', total_tickets - checked_in_tickets,
    'attendanceRate', CASE WHEN total_tickets > 0 THEN ROUND((checked_in_tickets::decimal / total_tickets) * 100) ELSE 0 END
  );
END;
$$;