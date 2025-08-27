/// <reference types="https://deno.land/x/deno@v1.28.0/lib/deno.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { ticketId } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from('event_tickets')
      .select(`
        *,
        ticket_types (
          id,
          name,
          ticket_form_fields (
            id,
            label,
            field_type,
            is_required
          )
        )
      `)
      .eq('id', ticketId)
      .single()

    if (ticketError) {
      throw new Error(`Failed to fetch ticket: ${ticketError.message}`)
    }

    // Get form responses for this ticket
    const { data: responses, error: responsesError } = await supabase
      .from('ticket_form_responses')
      .select(`
        *,
        ticket_form_fields (
          label,
          field_type
        )
      `)
      .eq('ticket_id', ticketId)

    if (responsesError) {
      console.error('Error fetching responses:', responsesError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        ticket,
        responses: responses || [],
        debug: {
          hasFormFields: ticket?.ticket_types?.ticket_form_fields?.length > 0,
          formFieldsCount: ticket?.ticket_types?.ticket_form_fields?.length || 0,
          responsesCount: responses?.length || 0
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Debug function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})