import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('x-paystack-signature')
    const body = await req.text()
    
    // Verify webhook signature
    const secret = Deno.env.get('PAYSTACK_LIVE_SECRET') || Deno.env.get('PAYSTACK_TEST_SECRET')
    if (!secret) {
      console.error('Paystack secret not found')
      return new Response('Configuration error', { status: 500, headers: corsHeaders })
    }

    const hash = await createHmac('sha512', secret).update(body).digest('hex')
    if (hash !== signature) {
      console.error('Invalid signature')
      return new Response('Invalid signature', { status: 400, headers: corsHeaders })
    }

    const event = JSON.parse(body)
    console.log('Paystack webhook event:', event.event, event.data?.reference)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(supabase, event.data)
        break
      case 'transfer.success':
        await handleTransferSuccess(supabase, event.data)
        break
      case 'transfer.failed':
        await handleTransferFailed(supabase, event.data)
        break
      default:
        console.log('Unhandled event type:', event.event)
    }

    return new Response('OK', { status: 200, headers: corsHeaders })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function handleChargeSuccess(supabase: any, data: any) {
  const reference = data.reference
  const amount = data.amount / 100 // Convert from kobo to naira
  
  console.log('Processing successful charge:', reference, amount)

  // Update payment status in event_payments
  const { error: paymentError } = await supabase
    .from('event_payments')
    .update({ status: 'success' })
    .eq('paystack_reference', reference)

  if (paymentError) {
    console.error('Error updating payment:', paymentError)
    return
  }

  // Get payment details with event info
  const { data: payment, error: fetchError } = await supabase
    .from('event_payments')
    .select(`
      *,
      events!inner(host_id)
    `)
    .eq('paystack_reference', reference)
    .eq('status', 'success')
    .single()

  if (fetchError || !payment) {
    console.error('Error fetching payment details:', fetchError)
    return
  }

  // Credit organizer wallet
  const hostId = payment.events.host_id
  const eventId = payment.event_id
  const paymentAmount = payment.amount

  const { error: walletError } = await supabase
    .from('admin_wallets')
    .upsert({
      admin_id: hostId,
      event_id: eventId,
      total_earnings: paymentAmount,
      available_balance: paymentAmount,
    }, {
      onConflict: 'admin_id,event_id',
      update: {
        total_earnings: 'admin_wallets.total_earnings + ' + paymentAmount,
        available_balance: 'admin_wallets.available_balance + ' + paymentAmount,
        updated_at: new Date().toISOString()
      }
    })

  if (walletError) {
    console.error('Error updating wallet:', walletError)
  } else {
    console.log('Wallet credited successfully:', hostId, paymentAmount)
  }
}

async function handleTransferSuccess(supabase: any, data: any) {
  const transferCode = data.transfer_code
  
  console.log('Processing successful transfer:', transferCode)

  // Update withdrawal request status
  const { error } = await supabase
    .from('withdrawal_requests')
    .update({ 
      status: 'completed',
      processed_at: new Date().toISOString()
    })
    .eq('paystack_transfer_code', transferCode)

  if (error) {
    console.error('Error updating withdrawal status:', error)
  }
}

async function handleTransferFailed(supabase: any, data: any) {
  const transferCode = data.transfer_code
  const failureReason = data.failure_reason || 'Transfer failed'
  
  console.log('Processing failed transfer:', transferCode, failureReason)

  // Get withdrawal details to refund wallet
  const { data: withdrawal, error: fetchError } = await supabase
    .from('withdrawal_requests')
    .select(`
      *,
      admin_wallets!inner(*)
    `)
    .eq('paystack_transfer_code', transferCode)
    .single()

  if (fetchError || !withdrawal) {
    console.error('Error fetching withdrawal details:', fetchError)
    return
  }

  // Refund the wallet balance
  const { error: walletError } = await supabase
    .from('admin_wallets')
    .update({
      available_balance: withdrawal.admin_wallets.available_balance + withdrawal.amount,
      updated_at: new Date().toISOString()
    })
    .eq('id', withdrawal.admin_wallet_id)

  if (walletError) {
    console.error('Error refunding wallet:', walletError)
  }

  // Update withdrawal request status
  const { error: withdrawalError } = await supabase
    .from('withdrawal_requests')
    .update({ 
      status: 'failed',
      failure_reason: failureReason,
      processed_at: new Date().toISOString()
    })
    .eq('paystack_transfer_code', transferCode)

  if (withdrawalError) {
    console.error('Error updating withdrawal status:', withdrawalError)
  }
}