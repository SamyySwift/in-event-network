
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
    const { action, ...params } = await req.json();
    console.log('Process withdrawal action:', action, 'params:', params);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get Paystack live secret key
    const paystackSecretKey = Deno.env.get("PAYSTACK_LIVE_SECRET");

    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    const paystackHeaders = {
      "Authorization": `Bearer ${paystackSecretKey}`,
      "Content-Type": "application/json",
    };

    switch (action) {
      case "get_banks": {
        console.log('Fetching Nigerian banks...');
        const response = await fetch("https://api.paystack.co/bank", {
          headers: paystackHeaders,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch banks: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Banks fetched successfully:', data.data?.length, 'banks');
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "verify_account": {
        const { account_number, bank_code, bank_name, event_id } = params;
        console.log('Verifying bank account:', { account_number, bank_code, bank_name });

        if (!account_number || !bank_code) {
          throw new Error("Account number and bank code are required");
        }

        // Verify account with Paystack
        const verifyUrl = `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`;
        const response = await fetch(verifyUrl, {
          headers: paystackHeaders,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Account verification failed:', errorData);
          throw new Error(errorData.message || "Failed to verify account");
        }

        const verificationData = await response.json();
        console.log('Account verification successful:', verificationData);

        if (!verificationData.status || !verificationData.data?.account_name) {
          throw new Error("Invalid account details");
        }

        const accountName = verificationData.data.account_name;

        // Get current user from auth header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          throw new Error("No authorization header");
        }

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
          authHeader.replace("Bearer ", "")
        );

        if (userError || !user) {
          throw new Error("Failed to authenticate user");
        }

        // Update admin wallet with verified bank details
        const { error: updateError } = await supabaseClient
          .from("admin_wallets")
          .update({
            bank_name,
            bank_code,
            account_number,
            account_name: accountName,
            is_bank_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq("admin_id", user.id)
          .eq("event_id", event_id);

        if (updateError) {
          console.error('Failed to update wallet:', updateError);
          throw new Error("Failed to save bank details");
        }

        console.log('Bank details saved successfully for user:', user.id);

        return new Response(JSON.stringify({
          success: true,
          account_name: accountName,
          message: "Account verified successfully"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create_recipient": {
        const { account_name, account_number, bank_code, event_id } = params;
        console.log('Creating Paystack recipient:', { account_name, account_number, bank_code });

        if (!account_name || !account_number || !bank_code) {
          throw new Error("Account name, number, and bank code are required");
        }

        // Create recipient in Paystack
        const recipientData = {
          type: "nuban",
          name: account_name,
          account_number,
          bank_code,
          currency: "NGN",
          description: `Kconect withdrawal recipient - ${account_name}`,
        };

        const response = await fetch("https://api.paystack.co/transferrecipient", {
          method: "POST",
          headers: paystackHeaders,
          body: JSON.stringify(recipientData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Recipient creation failed:', errorData);
          throw new Error(errorData.message || "Failed to create recipient");
        }

        const result = await response.json();
        console.log('Recipient created successfully:', result);

        if (!result.status || !result.data?.recipient_code) {
          throw new Error("Failed to create recipient");
        }

        // Get current user
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          throw new Error("No authorization header");
        }

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
          authHeader.replace("Bearer ", "")
        );

        if (userError || !user) {
          throw new Error("Failed to authenticate user");
        }

        // Update admin wallet with recipient code
        const { error: updateError } = await supabaseClient
          .from("admin_wallets")
          .update({
            recipient_code: result.data.recipient_code,
            updated_at: new Date().toISOString(),
          })
          .eq("admin_id", user.id)
          .eq("event_id", event_id);

        if (updateError) {
          console.error('Failed to save recipient code:', updateError);
          throw new Error("Failed to save recipient details");
        }

        console.log('Recipient code saved successfully for user:', user.id);

        return new Response(JSON.stringify({
          success: true,
          recipient_code: result.data.recipient_code,
          message: "Recipient created successfully"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "initiate_transfer": {
        const { 
          wallet_id, 
          amount, 
          bank_name, 
          account_number, 
          account_name, 
          recipient_code,
          new_balance,
          total_withdrawn
        } = params;

        console.log('Initiating transfer:', { 
          wallet_id, 
          amount, 
          bank_name, 
          account_number, 
          recipient_code 
        });

        if (!wallet_id || !amount || !recipient_code) {
          throw new Error("Wallet ID, amount, and recipient code are required");
        }

        // Convert amount to kobo for Paystack (multiply by 100)
        const amountInKobo = Math.round(amount * 100);

        // Create transfer reference
        const transferReference = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Initiate transfer with Paystack
        const transferData = {
          source: "balance",
          amount: amountInKobo,
          recipient: recipient_code,
          reason: `Kconect ticket sales withdrawal - ${account_name}`,
          reference: transferReference,
        };

        const response = await fetch("https://api.paystack.co/transfer", {
          method: "POST",
          headers: paystackHeaders,
          body: JSON.stringify(transferData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Transfer initiation failed:', errorData);
          throw new Error(errorData.message || "Failed to initiate transfer");
        }

        const result = await response.json();
        console.log('Transfer initiated:', result);

        if (!result.status) {
          throw new Error(result.message || "Transfer failed");
        }

        // Create withdrawal request record
        const { error: withdrawalError } = await supabaseClient
          .from("withdrawal_requests")
          .insert({
            admin_wallet_id: wallet_id,
            amount: amountInKobo,
            amount_naira: amount,
            status: result.data.status === "success" ? "completed" : "processing",
            paystack_transfer_code: result.data.transfer_code,
            bank_name,
            account_number,
            account_name,
            created_at: new Date().toISOString(),
          });

        if (withdrawalError) {
          console.error('Failed to create withdrawal request:', withdrawalError);
          // Don't throw here as the transfer was successful
        }

        // Update wallet balance
        const { error: balanceError } = await supabaseClient
          .from("admin_wallets")
          .update({
            available_balance: new_balance,
            withdrawn_amount: total_withdrawn + amount,
            last_payout_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", wallet_id);

        if (balanceError) {
          console.error('Failed to update wallet balance:', balanceError);
          throw new Error("Transfer initiated but failed to update balance");
        }

        console.log('Withdrawal completed successfully for wallet:', wallet_id);

        return new Response(JSON.stringify({
          success: true,
          transfer_code: result.data.transfer_code,
          status: result.data.status,
          message: result.data.status === "success" 
            ? "Withdrawal completed successfully" 
            : "Withdrawal is being processed"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("Process withdrawal error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "An unexpected error occurred" 
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
