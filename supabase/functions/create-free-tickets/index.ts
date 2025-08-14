import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { eventId, tickets } = await req.json();

    if (!eventId || !Array.isArray(tickets) || tickets.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate tickets that require login
    const ticketTypeIds = [...new Set(tickets.map((t: any) => t.ticket_type_id))];
    const { data: ticketTypes, error: ticketTypesError } = await supabaseService
      .from('ticket_types')
      .select('id, requires_login, name')
      .in('id', ticketTypeIds);

    if (ticketTypesError) {
      console.error('Error fetching ticket types:', ticketTypesError);
      throw new Error('Failed to validate ticket types');
    }

    // Validate each ticket
    for (const ticket of tickets) {
      const ticketType = ticketTypes?.find(tt => tt.id === ticket.ticket_type_id);
      if (ticketType?.requires_login && !ticket.user_id) {
        console.error('Login required but no user_id:', { ticketType: ticketType.name, user_id: ticket.user_id });
        return new Response(JSON.stringify({ 
          error: `Login required for ${ticketType.name} but user not authenticated` 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    console.log('Ticket validation passed. Creating tickets...');

    // Force free + completed for guest flow
    const rows = tickets.map((t: any) => ({
      event_id: t.event_id || eventId,
      ticket_type_id: t.ticket_type_id,
      user_id: t.user_id || null,
      first_name: t.first_name || null,
      last_name: t.last_name || null,
      guest_name: t.guest_name || null,
      guest_email: t.guest_email || null,
      guest_phone: t.guest_phone || null,
      price: 0,
      payment_status: "completed",
      payment_reference: t.payment_reference || `FREE_${Date.now()}_${crypto.randomUUID()}`,
      qr_code_data: t.qr_code_data,
    }));

    const { data: inserted, error: insertError } = await supabaseService
      .from("event_tickets")
      .insert(rows)
      .select(`
        id,
        ticket_number,
        qr_code_data,
        price,
        guest_name,
        guest_email,
        ticket_types ( name, description )
      `);

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Decrement available quantities for free tickets as well
    try {
      const reductions: Record<string, number> = {};
      for (const ticket of tickets) {
        const ticketTypeId = ticket.ticket_type_id;
        if (ticketTypeId) {
          reductions[ticketTypeId] = (reductions[ticketTypeId] || 0) + 1;
        }
      }

      for (const [ticketTypeId, reduceBy] of Object.entries(reductions)) {
        const { data: current, error: fetchErr } = await supabaseService
          .from('ticket_types')
          .select('available_quantity')
          .eq('id', ticketTypeId)
          .single();

        if (!fetchErr && current) {
          const newQty = Math.max(0, (current.available_quantity || 0) - reduceBy);
          const { error: updErr } = await supabaseService
            .from('ticket_types')
            .update({ available_quantity: newQty })
            .eq('id', ticketTypeId);
          
          if (updErr) {
            console.error('Quantity update error:', updErr);
          }
        } else if (fetchErr) {
          console.error('Quantity fetch error:', fetchErr);
        }
      }
    } catch (qtyErr) {
      console.error('Quantity decrement exception:', qtyErr);
    }

    return new Response(JSON.stringify({ tickets: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
