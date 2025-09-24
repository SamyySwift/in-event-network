import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id

    // Delete all user-related data in the correct order
    const deletions = [
      // Delete chat messages
      supabaseClient.from('chat_messages').delete().eq('user_id', userId),
      
      // Delete direct messages (both sent and received)
      supabaseClient.from('direct_messages').delete().or(`sender_id.eq.${userId},recipient_id.eq.${userId}`),
      
      // Delete regular messages (both sent and received)
      supabaseClient.from('messages').delete().or(`sender_id.eq.${userId},recipient_id.eq.${userId}`),
      
      // Delete poll votes
      supabaseClient.from('poll_votes').delete().eq('user_id', userId),
      
      // Delete questions
      supabaseClient.from('questions').delete().eq('user_id', userId),
      
      // Delete suggestions
      supabaseClient.from('suggestions').delete().eq('user_id', userId),
      
      // Delete event tickets
      supabaseClient.from('event_tickets').delete().eq('user_id', userId),
      
      // Delete event payments
      supabaseClient.from('event_payments').delete().eq('user_id', userId),
      
      // Delete admin wallets
      supabaseClient.from('admin_wallets').delete().eq('admin_id', userId),
      
      // Delete check-ins
      supabaseClient.from('check_ins').delete().eq('admin_id', userId),
      
      // Delete media files
      supabaseClient.from('media_files').delete().eq('uploaded_by', userId),
      
      // Delete events hosted by user
      supabaseClient.from('events').delete().eq('host_id', userId),
      
      // Delete connections
      supabaseClient.from('connections').delete().or(`requester_id.eq.${userId},recipient_id.eq.${userId}`),
      
      // Delete notifications
      supabaseClient.from('notifications').delete().eq('user_id', userId),
      
      // Delete event participations
      supabaseClient.from('event_participants').delete().eq('user_id', userId),
    ]

    // Execute all deletions
    for (const deletion of deletions) {
      const { error } = await deletion
      if (error) {
        console.error('Error during deletion:', error)
        // Continue with other deletions even if one fails
      }
    }

    // Delete the profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      throw profileError
    }

    // Finally, delete the auth user (this requires service role key)
    const { error: authError } = await supabaseClient.auth.admin.deleteUser(userId)
    
    if (authError) {
      console.error('Error deleting auth user:', authError)
      throw authError
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User account deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})