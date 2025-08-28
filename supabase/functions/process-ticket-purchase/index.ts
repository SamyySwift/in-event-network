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
      totalAmount,
      formResponses 
    } = await req.json()

    console.log('Processing ticket purchase:', { eventId, tickets, userInfo, paystackReference, totalAmount, formResponses })

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

    // Record payment (use upsert to handle duplicates)
    const { data: payment, error: paymentError } = await supabase
      .from('event_payments')
      .upsert({
        event_id: eventId,
        user_id: userInfo.userId || null,
        amount: totalAmount, // Keep in kobo for consistency
        currency: 'NGN',
        paystack_reference: paystackReference,
        status: 'success'
      }, {
        onConflict: 'event_id,user_id',
        ignoreDuplicates: false
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
          // Always include guest info for fallback, but set user_id when logged in
          guest_name: userInfo.fullName,
          guest_email: userInfo.email,
          guest_phone: userInfo.phone,
        }

        ticketPromises.push(
          supabase.from('event_tickets')
            .insert(ticketData)
            .select(`
              *,
              ticket_types (
                name,
                description
              ),
              events (
                name,
                start_time,
                location
              )
            `)
            .single()
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

    // Quantity will be decremented automatically by database triggers

    // Save form responses if provided
    if (formResponses && Array.isArray(formResponses) && formResponses.length > 0) {
      console.log('=== FORM RESPONSES PROCESSING START ===')
      console.log('Received form responses count:', formResponses.length)
      console.log('Form responses structure:', JSON.stringify(formResponses, null, 2))
      console.log('Created tickets count:', createdTickets.length)
      
      // First, validate that we have valid form field IDs
      const allFieldIds = new Set()
      for (const response of formResponses) {
        if (response.responses && typeof response.responses === 'object') {
          for (const fieldId of Object.keys(response.responses)) {
            allFieldIds.add(fieldId)
          }
        }
      }
      
      console.log('All field IDs found in responses:', Array.from(allFieldIds))
      
      // Validate field IDs exist in database
      if (allFieldIds.size > 0) {
        const { data: validFields, error: fieldValidationError } = await supabase
          .from('ticket_form_fields')
          .select('id')
          .in('id', Array.from(allFieldIds))
        
        if (fieldValidationError) {
          console.error('Error validating form fields:', fieldValidationError)
        } else {
          const validFieldIds = new Set(validFields.map(f => f.id))
          console.log('Valid field IDs from database:', Array.from(validFieldIds))
          
          // Filter out invalid field IDs
          const invalidFieldIds = Array.from(allFieldIds).filter(id => !validFieldIds.has(id))
          if (invalidFieldIds.length > 0) {
            console.warn('Found invalid field IDs (will be skipped):', invalidFieldIds)
          }
        }
      }
      
      // Map ticket IDs to form responses
      const formResponseInserts = []
      
      for (let responseIndex = 0; responseIndex < formResponses.length; responseIndex++) {
        const response = formResponses[responseIndex]
        const { ticketTypeId, attendeeIndex, responses } = response
        
        console.log(`\n--- Processing response ${responseIndex + 1}/${formResponses.length} ---`)
        console.log(`Ticket Type ID: ${ticketTypeId}`)
        console.log(`Attendee Index: ${attendeeIndex}`)
        console.log('Response data:', JSON.stringify(responses, null, 2))
        
        // Find tickets for this type
        const ticketsForType = createdTickets.filter(t => t.ticket_type_id === ticketTypeId)
        console.log(`Found ${ticketsForType.length} tickets for type ${ticketTypeId}`)
        
        if (attendeeIndex < ticketsForType.length) {
          const ticket = ticketsForType[attendeeIndex]
          console.log(`Using ticket ID: ${ticket.id} for attendee ${attendeeIndex}`)
          
          if (ticket && responses && typeof responses === 'object') {
            for (const [fieldId, value] of Object.entries(responses)) {
              // Skip empty values
              if (value === undefined || value === null || value === '') {
                console.log(`Skipping empty value for field ${fieldId}`)
                continue
              }
              
              // The response_value column is JSONB, so we need to properly format the value
              let jsonValue;
              if (typeof value === 'string') {
                // For string values, store as JSON string
                jsonValue = JSON.stringify(value);
              } else if (typeof value === 'object') {
                // For objects, stringify them
                jsonValue = JSON.stringify(value);
              } else {
                // For other types (number, boolean), convert to JSON
                jsonValue = JSON.stringify(value);
              }
              
              console.log(`Adding form response: field ${fieldId} = ${value} (JSON: ${jsonValue})`)
              formResponseInserts.push({
                ticket_id: ticket.id,
                form_field_id: fieldId,
                response_value: jsonValue
              })
            }
          } else {
            console.log('Invalid ticket or responses object')
          }
        } else {
          console.error(`Attendee index ${attendeeIndex} out of range for ${ticketsForType.length} tickets`)
        }
      }
      
      console.log('\n=== FINAL FORM RESPONSE INSERTS ===')
      console.log('Total inserts to process:', formResponseInserts.length)
      console.log('Insert data:', JSON.stringify(formResponseInserts, null, 2))
      
      if (formResponseInserts.length > 0) {
        console.log('Attempting to insert form responses...')
        const { data: insertResult, error: formError } = await supabase
          .from('ticket_form_responses')
          .insert(formResponseInserts)
          .select('*')
        
        if (formError) {
          console.error('❌ Error saving form responses:', formError)
          console.error('Error details:', JSON.stringify(formError, null, 2))
        } else {
          console.log('✅ Form responses saved successfully!')
          console.log('Inserted records:', insertResult?.length || 0)
          console.log('Insert result:', JSON.stringify(insertResult, null, 2))
        }
      } else {
        console.log('⚠️ No valid form responses to insert')
      }
      
      console.log('=== FORM RESPONSES PROCESSING END ===\n')
    } else {
      console.log('No form responses provided or invalid format')
      console.log('formResponses type:', typeof formResponses)
      console.log('formResponses isArray:', Array.isArray(formResponses))
      console.log('formResponses length:', formResponses?.length)
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