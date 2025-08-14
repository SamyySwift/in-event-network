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
    const { 
      eventId, 
      tickets, 
      userInfo, 
      paystackReference, 
      totalAmount 
    } = await req.json()

    console.log('Processing ticket purchase:', { eventId, tickets, userInfo, paystackReference, totalAmount })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify payment with Paystack first
    const paystackSecretKey = Deno.env.get('PAYSTACK_LIVE_SECRET')
    
    if (!paystackSecretKey) {
      throw new Error('Paystack configuration not found')
    }

    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${paystackReference}`, {
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
    })

    const paystackData = await paystackResponse.json()
    console.log('Paystack verification response:', { status: paystackResponse.status, data: paystackData })

    if (!paystackResponse.ok || paystackData.data?.status !== 'success') {
      console.error('Payment verification failed:', { 
        ok: paystackResponse.ok, 
        status: paystackData.data?.status,
        reference: paystackReference 
      })
      throw new Error('Payment verification failed')
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('host_id')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      throw new Error('Event not found')
    }

    // Record payment
    const { data: payment, error: paymentError } = await supabase
      .from('event_payments')
      .insert({
        event_id: eventId,
        user_id: userInfo.userId || null,
        amount: totalAmount, // Keep in kobo for consistency
        currency: 'NGN',
        paystack_reference: paystackReference,
        status: 'success'
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error recording payment:', paymentError)
      throw new Error('Failed to record payment')
    }

    // Create tickets
    // Create tickets with unique QR codes
    const ticketPromises: Promise<any>[] = []
    
    for (const ticket of tickets) {
      for (let i = 0; i < ticket.quantity; i++) {
        // Generate truly unique QR code
        const uniqueId = crypto.randomUUID()
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 15)
        const uniqueQRCode = `${eventId}-${ticket.ticketTypeId}-${timestamp}-${uniqueId}-${randomSuffix}-${i}`
        
        const ticketData = {
          event_id: eventId,
          user_id: userInfo.userId || null,
          ticket_type_id: ticket.ticketTypeId,
          price: ticket.price,
          payment_status: 'completed',
          payment_reference: paystackReference,
          qr_code_data: uniqueQRCode,
          guest_name: userInfo.userId ? null : userInfo.fullName,
          guest_email: userInfo.userId ? null : userInfo.email,
          guest_phone: userInfo.userId ? null : userInfo.phone,
        }

        ticketPromises.push(
          supabase.from('event_tickets').insert(ticketData).select().single()
        )
      }
    }

    const ticketResults = await Promise.all(ticketPromises)
    const createdTickets = ticketResults
      .map((result: any) => result.data)
      .filter((ticket: any) => ticket !== null)

    if (createdTickets.length === 0) {
      throw new Error('Failed to create tickets')
    }

    // Decrement available quantities per ticket type
    try {
      const reductions: Record<string, number> = {}
      for (const t of tickets) {
        reductions[t.ticketTypeId] = (reductions[t.ticketTypeId] || 0) + (t.quantity || 0)
      }
      for (const [ticketTypeId, reduceBy] of Object.entries(reductions)) {
        const { data: current, error: fetchErr } = await supabase
          .from('ticket_types')
          .select('available_quantity')
          .eq('id', ticketTypeId)
          .single()
        if (!fetchErr && current) {
          const newQty = Math.max(0, (current.available_quantity || 0) - reduceBy)
          const { error: updErr } = await supabase
            .from('ticket_types')
            .update({ available_quantity: newQty })
            .eq('id', ticketTypeId)
          if (updErr) console.error('Quantity update error:', updErr)
        } else if (fetchErr) {
          console.error('Quantity fetch error:', fetchErr)
        }
      }
    } catch (qtyErr) {
      console.error('Quantity decrement exception:', qtyErr)
    }

    // Credit organizer wallet if payment amount > 0
    // The wallet will be updated automatically by the trigger function
    console.log('Wallet will be updated by trigger for event:', eventId, 'amount:', totalAmount);

    return new Response(
      JSON.stringify({ 
        success: true, 
        tickets: createdTickets,
        payment: payment,
        message: 'Tickets purchased successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Ticket purchase error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})