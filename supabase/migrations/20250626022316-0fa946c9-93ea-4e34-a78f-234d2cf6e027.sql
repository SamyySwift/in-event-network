
-- Create event_tickets table to store individual tickets with QR codes
CREATE TABLE public.event_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ticket_number VARCHAR(20) NOT NULL UNIQUE,
  ticket_type_id UUID NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  qr_code_data TEXT NOT NULL UNIQUE,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  check_in_status BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_in_by UUID REFERENCES profiles(id),
  guest_email TEXT,
  guest_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket_types table to define different ticket categories per event
CREATE TABLE public.ticket_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  max_quantity INTEGER,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_wallets table to track admin earnings from ticket sales
CREATE TABLE public.admin_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  total_earnings INTEGER NOT NULL DEFAULT 0,
  available_balance INTEGER NOT NULL DEFAULT 0,
  withdrawn_amount INTEGER NOT NULL DEFAULT 0,
  last_payout_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(admin_id, event_id)
);

-- Create check_ins table to log all check-in activities
CREATE TABLE public.check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES event_tickets(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES profiles(id),
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  check_in_method TEXT NOT NULL DEFAULT 'qr_scan',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint for ticket_type_id in event_tickets
ALTER TABLE public.event_tickets 
ADD CONSTRAINT fk_ticket_type 
FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_event_tickets_event_id ON event_tickets(event_id);
CREATE INDEX idx_event_tickets_user_id ON event_tickets(user_id);
CREATE INDEX idx_event_tickets_qr_code ON event_tickets(qr_code_data);
CREATE INDEX idx_ticket_types_event_id ON ticket_types(event_id);
CREATE INDEX idx_admin_wallets_admin_id ON admin_wallets(admin_id);
CREATE INDEX idx_check_ins_ticket_id ON check_ins(ticket_id);

-- Enable Row Level Security on all new tables
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_tickets
CREATE POLICY "Users can view their own tickets" 
  ON public.event_tickets 
  FOR SELECT 
  USING (auth.uid() = user_id OR guest_email = (SELECT email FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all tickets for their events" 
  ON public.event_tickets 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM events WHERE id = event_id AND host_id = auth.uid()));

CREATE POLICY "Anyone can insert tickets (for guest purchases)" 
  ON public.event_tickets 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can update tickets for their events" 
  ON public.event_tickets 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM events WHERE id = event_id AND host_id = auth.uid()));

-- RLS Policies for ticket_types
CREATE POLICY "Anyone can view active ticket types" 
  ON public.ticket_types 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage ticket types for their events" 
  ON public.ticket_types 
  FOR ALL 
  USING (EXISTS (SELECT 1 FROM events WHERE id = event_id AND host_id = auth.uid()));

-- RLS Policies for admin_wallets
CREATE POLICY "Admins can view their own wallets" 
  ON public.admin_wallets 
  FOR SELECT 
  USING (auth.uid() = admin_id);

CREATE POLICY "Admins can manage their own wallets" 
  ON public.admin_wallets 
  FOR ALL 
  USING (auth.uid() = admin_id);

-- RLS Policies for check_ins
CREATE POLICY "Admins can view check-ins for their events" 
  ON public.check_ins 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM event_tickets et 
    JOIN events e ON et.event_id = e.id 
    WHERE et.id = ticket_id AND e.host_id = auth.uid()
  ));

CREATE POLICY "Admins can insert check-ins for their events" 
  ON public.check_ins 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM event_tickets et 
    JOIN events e ON et.event_id = e.id 
    WHERE et.id = ticket_id AND e.host_id = auth.uid()
  ));

-- Create function to generate unique ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    ticket_num TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate format: TKT-YYYYMMDD-XXXX (where X is random)
        ticket_num := 'TKT-' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Check if this number already exists
        SELECT EXISTS(SELECT 1 FROM event_tickets WHERE ticket_number = ticket_num) INTO exists_check;
        
        -- If it doesn't exist, return it
        IF NOT exists_check THEN
            RETURN ticket_num;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
    BEFORE INSERT ON event_tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_number();

-- Create function to update admin wallet on ticket purchase
CREATE OR REPLACE FUNCTION update_admin_wallet_on_purchase()
RETURNS TRIGGER AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the admin/host ID for this event
    SELECT host_id INTO admin_user_id FROM events WHERE id = NEW.event_id;
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert or update admin wallet
        INSERT INTO admin_wallets (admin_id, event_id, total_earnings, available_balance)
        VALUES (admin_user_id, NEW.event_id, NEW.price, NEW.price)
        ON CONFLICT (admin_id, event_id) 
        DO UPDATE SET 
            total_earnings = admin_wallets.total_earnings + NEW.price,
            available_balance = admin_wallets.available_balance + NEW.price,
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_wallet
    AFTER INSERT ON event_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_wallet_on_purchase();

-- Create updated_at triggers for all new tables
CREATE TRIGGER trigger_event_tickets_updated_at
    BEFORE UPDATE ON event_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_ticket_types_updated_at
    BEFORE UPDATE ON ticket_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_admin_wallets_updated_at
    BEFORE UPDATE ON admin_wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
