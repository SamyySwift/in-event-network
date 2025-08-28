// Debug utilities for form data flow
import { supabase } from '@/integrations/supabase/client';

export const debugFormDataFlow = async (ticketId: string) => {
  try {
    console.log('=== DEBUGGING FORM DATA FLOW ===');
    console.log('Ticket ID:', ticketId);
    
    // 1. Check ticket details
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
            is_required,
            field_order
          )
        )
      `)
      .eq('id', ticketId)
      .single();

    if (ticketError) {
      console.error('Error fetching ticket:', ticketError);
      return;
    }

    console.log('Ticket found:', ticket);
    console.log('Form fields for ticket type:', ticket?.ticket_types?.ticket_form_fields);

    // 2. Check form responses
    const { data: responses, error: responsesError } = await supabase
      .from('ticket_form_responses')
      .select(`
        *,
        ticket_form_fields (
          label,
          field_type,
          field_order
        )
      `)
      .eq('ticket_id', ticketId);

    console.log('Form responses found:', responses);
    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
    }

    // 3. Check if there are any form responses at all in the database
    const { data: allResponses, error: allResponsesError } = await supabase
      .from('ticket_form_responses')
      .select('*')
      .limit(5);

    console.log('Recent form responses in database:', allResponses);

    // 4. Debug using the debug edge function
    const { data: debugResult, error: debugError } = await supabase.functions.invoke('debug-form-data', {
      body: { ticketId }
    });

    console.log('Debug function result:', debugResult);
    if (debugError) {
      console.error('Debug function error:', debugError);
    }

    console.log('=== END DEBUG ===');
    
    return {
      ticket,
      responses,
      allResponses,
      debugResult
    };
  } catch (error) {
    console.error('Debug flow error:', error);
  }
};

// Function to manually test form response insertion
export const testFormResponseInsertion = async (ticketId: string, formFieldId: string, responseValue: string) => {
  try {
    console.log('Testing manual form response insertion...');
    
    const { data, error } = await supabase
      .from('ticket_form_responses')
      .insert({
        ticket_id: ticketId,
        form_field_id: formFieldId,
        response_value: responseValue
      })
      .select();

    if (error) {
      console.error('Error inserting test response:', error);
    } else {
      console.log('Test response inserted successfully:', data);
    }

    return { data, error };
  } catch (error) {
    console.error('Test insertion error:', error);
  }
};