import { supabase } from '@/integrations/supabase/client';

export const testAdminChatAccess = async (eventId: string, userId: string) => {
  console.log('Testing admin chat access...');
  
  try {
    // Check if user is event host
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('host_id, name')
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('Error fetching event:', eventError);
      return { success: false, error: 'Event not found' };
    }

    const isHost = event.host_id === userId;
    console.log('Is user event host?', isHost);

    // Check if user is event participant
    const { data: participation, error: participationError } = await supabase
      .from('event_participants')
      .select('id, joined_at')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (participationError && participationError.code !== 'PGRST116') {
      console.error('Error checking participation:', participationError);
      return { success: false, error: 'Error checking participation' };
    }

    const isParticipant = !!participation;
    console.log('Is user event participant?', isParticipant);

    // Test message sending capability
    const testMessage = `Test message from admin - ${new Date().toISOString()}`;
    const { error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        content: testMessage,
        event_id: eventId,
      });

    if (messageError) {
      console.error('Error sending test message:', messageError);
      return { 
        success: false, 
        error: `Cannot send message: ${messageError.message}`,
        isHost,
        isParticipant,
      };
    }

    console.log('Test message sent successfully');
    
    // Clean up test message
    await supabase
      .from('chat_messages')
      .delete()
      .eq('content', testMessage)
      .eq('user_id', userId);

    return { 
      success: true, 
      message: 'Admin can send chat messages',
      isHost,
      isParticipant,
    };

  } catch (error) {
    console.error('Test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};