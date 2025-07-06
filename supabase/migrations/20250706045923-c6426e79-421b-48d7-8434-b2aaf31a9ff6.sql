-- Create table for custom form fields attached to ticket types
CREATE TABLE ticket_form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
  field_type VARCHAR(50) NOT NULL, -- 'short_answer', 'paragraph', 'multiple_choice', 'checkboxes', 'dropdown', 'date', 'time', 'grid'
  label TEXT NOT NULL,
  helper_text TEXT,
  is_required BOOLEAN DEFAULT false,
  field_order INTEGER NOT NULL DEFAULT 0,
  field_options JSONB, -- For storing options for multiple choice, checkboxes, dropdown, grid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for storing form responses
CREATE TABLE ticket_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES event_tickets(id) ON DELETE CASCADE,
  form_field_id UUID NOT NULL REFERENCES ticket_form_fields(id) ON DELETE CASCADE,
  response_value JSONB NOT NULL, -- Store the actual response data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_ticket_form_fields_ticket_type ON ticket_form_fields(ticket_type_id);
CREATE INDEX idx_ticket_form_fields_order ON ticket_form_fields(ticket_type_id, field_order);
CREATE INDEX idx_ticket_form_responses_ticket ON ticket_form_responses(ticket_id);
CREATE INDEX idx_ticket_form_responses_field ON ticket_form_responses(form_field_id);

-- Enable RLS
ALTER TABLE ticket_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_form_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for ticket_form_fields
CREATE POLICY "Admins can manage form fields for their events" ON ticket_form_fields
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ticket_types tt
      JOIN events e ON tt.event_id = e.id
      WHERE tt.id = ticket_form_fields.ticket_type_id 
      AND e.host_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view form fields for active ticket types" ON ticket_form_fields
  FOR SELECT USING (true);

-- RLS policies for ticket_form_responses
CREATE POLICY "Admins can view responses for their events" ON ticket_form_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_tickets et
      JOIN events e ON et.event_id = e.id
      WHERE et.id = ticket_form_responses.ticket_id 
      AND e.host_id = auth.uid()
    )
  );

CREATE POLICY "System can insert form responses" ON ticket_form_responses
  FOR INSERT WITH CHECK (true);

-- Add trigger for updating updated_at
CREATE TRIGGER update_ticket_form_fields_updated_at
  BEFORE UPDATE ON ticket_form_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();