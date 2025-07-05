
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { action, ...payload } = await req.json()
    const paystackSecretKey = Deno.env.get('PAYSTACK_TEST_SECRET') || Deno.env.get('PAYSTACK_LIVE_SECRET')
    
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured')
    }

    const paystackHeaders = {
      'Authorization': `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json',
    }

    let result

    switch (action) {
      case 'verify_account':
        console.log('Verifying account:', payload)
        
        // Fix: Construct the URL properly with query parameters
        const verifyUrl = `https://api.paystack.co/bank/resolve?account_number=${payload.account_number}&bank_code=${payload.bank_code}`
        console.log('Verify URL:', verifyUrl)
        
        const verifyResponse = await fetch(verifyUrl, {
          method: 'GET',
          headers: paystackHeaders,
        })
        
        if (!verifyResponse.ok) {
          const error = await verifyResponse.json()
          console.error('Paystack verification error:', error)
          throw new Error(error.message || 'Account verification failed')
        }
        
        result = await verifyResponse.json()
        console.log('Account verification result:', result)
        
        if (!result.status || !result.data) {
          throw new Error('Invalid response from Paystack')
        }
        
        // Update wallet with verified bank details
        const { error: updateError } = await supabase
          .from('admin_wallets')
          .update({
            bank_name: payload.bank_name,
            account_number: payload.account_number,
            account_name: result.data.account_name,
            bank_code: payload.bank_code,
            is_bank_verified: true,
          })
          .eq('admin_id', user.id)
          .eq('event_id', payload.event_id)

        if (updateError) throw updateError
        
        break

      case 'create_recipient':
        console.log('Creating recipient:', payload)
        const recipientResponse = await fetch('https://api.paystack.co/transferrecipient', {
          method: 'POST',
          headers: paystackHeaders,
          body: JSON.stringify({
            type: 'nuban',
            name: payload.account_name,
            account_number: payload.account_number,
            bank_code: payload.bank_code,
          })
        })
        
        if (!recipientResponse.ok) {
          const error = await recipientResponse.json()
          throw new Error(error.message || 'Failed to create recipient')
        }
        
        result = await recipientResponse.json()
        console.log('Recipient creation result:', result)
        
        // Update wallet with recipient code
        const { error: recipientUpdateError } = await supabase
          .from('admin_wallets')
          .update({
            recipient_code: result.data.recipient_code,
          })
          .eq('admin_id', user.id)
          .eq('event_id', payload.event_id)

        if (recipientUpdateError) throw recipientUpdateError
        
        break

      case 'initiate_transfer':
        console.log('Initiating transfer:', payload)
        
        // Create withdrawal request first
        const { data: withdrawalRequest, error: withdrawalError } = await supabase
          .from('withdrawal_requests')
          .insert({
            admin_wallet_id: payload.wallet_id,
            amount: payload.amount,
            bank_name: payload.bank_name,
            account_number: payload.account_number,
            account_name: payload.account_name,
            paystack_recipient_code: payload.recipient_code,
            status: 'processing'
          })
          .select()
          .single()

        if (withdrawalError) throw withdrawalError
        
        // Initiate transfer with Paystack (add 50 NGN transfer fee)
        const transferFee = 5000 // 50 NGN in kobo
        const totalAmountWithFee = payload.amount + transferFee
        
        const transferResponse = await fetch('https://api.paystack.co/transfer', {
          method: 'POST',
          headers: paystackHeaders,
          body: JSON.stringify({
            source: 'balance',
            amount: totalAmountWithFee, // Amount + fee in kobo
            recipient: payload.recipient_code,
            reason: `Wallet withdrawal - ${new Date().toISOString()}`,
          })
        })
        
        if (!transferResponse.ok) {
          const error = await transferResponse.json()
          
          // Update withdrawal request with failure
          await supabase
            .from('withdrawal_requests')
            .update({
              status: 'failed',
              failure_reason: error.message || 'Transfer failed',
              processed_at: new Date().toISOString()
            })
            .eq('id', withdrawalRequest.id)
          
          throw new Error(error.message || 'Transfer failed')
        }
        
        result = await transferResponse.json()
        console.log('Transfer result:', result)
        
        // Update withdrawal request and wallet
        const { error: transferUpdateError } = await supabase
          .from('withdrawal_requests')
          .update({
            paystack_transfer_code: result.data.transfer_code,
            status: result.data.status === 'success' ? 'completed' : 'processing',
            processed_at: result.data.status === 'success' ? new Date().toISOString() : null
          })
          .eq('id', withdrawalRequest.id)

        if (transferUpdateError) throw transferUpdateError
        
        // Update wallet balance if transfer is successful (deduct additional fee)
        if (result.data.status === 'success') {
          const feeInNaira = transferFee / 100 // Convert fee to naira
          const { error: balanceUpdateError } = await supabase
            .from('admin_wallets')
            .update({
              available_balance: payload.new_balance - feeInNaira, // Deduct fee from available balance
              withdrawn_amount: payload.total_withdrawn + (payload.amount / 100), // Store withdrawn amount in naira
              last_payout_at: new Date().toISOString()
            })
            .eq('id', payload.wallet_id)

          if (balanceUpdateError) throw balanceUpdateError
        }
        
        break

      case 'get_banks':
        console.log('Fetching Nigerian banks')
        const banksResponse = await fetch('https://api.paystack.co/bank', {
          method: 'GET',
          headers: paystackHeaders,
        })
        
        if (!banksResponse.ok) {
          throw new Error('Failed to fetch banks')
        }
        
        result = await banksResponse.json()
        console.log('Banks fetched:', result.data?.length)
        
        // Filter for Nigerian banks only
        result.data = result.data.filter((bank: any) => bank.country === 'Nigeria')
        
        break

      default:
        throw new Error('Invalid action')
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in process-withdrawal function:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
