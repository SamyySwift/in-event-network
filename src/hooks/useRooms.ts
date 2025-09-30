import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';
import { useToast } from '@/hooks/use-toast';

export type ChatRoom = {
  id: string;
  event_id: string;
  name: string;
  tag?: string | null;
  color?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export const useRooms = (overrideEventId?: string) => {
  const { currentUser } = useAuth();
  const { currentEventId } = useAttendeeEventContext();
  const { toast } = useToast();
  const effectiveEventId = overrideEventId ?? currentEventId;

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);

  const fetchRooms = async () => {
    if (!effectiveEventId) {
      setRooms([]);
      setParticipantCounts({});
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('event_id', effectiveEventId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRooms(data || []);

      const roomIds = (data || []).map(r => r.id);
      if (roomIds.length) {
        const { data: members, error: mErr } = await supabase
          .from('room_members')
          .select('room_id, user_id')
          .in('room_id', roomIds);

        if (mErr) {
          console.warn('Failed to fetch room members:', mErr.message);
          setParticipantCounts({});
        } else {
          const counts = members?.reduce((acc: Record<string, number>, m: any) => {
            acc[m.room_id] = (acc[m.room_id] || 0) + 1;
            return acc;
          }, {}) ?? {};
          setParticipantCounts(counts);
        }
      } else {
        setParticipantCounts({});
      }
    } catch (err: any) {
      toast({ title: 'Failed to fetch rooms', description: err?.message || 'Please try again later', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // optional: set up realtime on chat_rooms/room_members if needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveEventId]);

  const createRoom = async (name: string, tag?: string, color?: string) => {
    if (!currentUser?.id || !effectiveEventId) return;
    try {
      const { data, error } = await supabase.from('chat_rooms').insert({
        name,
        tag: tag || null,
        color: color || '#3b82f6',
        event_id: effectiveEventId,
        created_by: currentUser.id,
      }).select('*').single();

      if (error) throw error;
      // auto-join creator
      await joinRoom(data.id);
      toast({ title: 'Room created', description: 'Your room is ready.' });
      await fetchRooms();
      setSelectedRoom(data);
    } catch (err: any) {
      toast({ title: 'Create failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!currentUser?.id || !effectiveEventId) return;
    try {
      console.log('Attempting to join room:', roomId, 'for user:', currentUser.id);
      
      // Ensure user is a participant of this event (required by RLS to send/read messages)
      const { data: participation, error: participationError } = await supabase
        .from('event_participants')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('event_id', effectiveEventId);

      if (participationError) {
        console.error('Error checking participation:', participationError);
      }

      if (!participation || participation.length === 0) {
        console.log('User not a participant yet — attempting to join event:', effectiveEventId);
        const { error: joinErr } = await supabase
          .from('event_participants')
          .insert({ event_id: effectiveEventId, user_id: currentUser.id });
        if (joinErr && (joinErr as any).code !== '23505') {
          // 23505 = unique_violation (already joined)
          console.error('Failed to add user to event_participants:', joinErr);
          throw new Error('You must join the event before entering rooms. Please scan the event QR again.');
        }
      }
      
      // Now join the room (idempotent)
      const { error } = await supabase.from('room_members').insert({
        room_id: roomId,
        user_id: currentUser.id,
      });

      if (error && (error as any).code !== '23505') {
        // If it wasn't a duplicate-key error, rethrow
        console.error('Room join error:', error);
        // Check if it's a permission error (RLS)
        if (error.message?.includes('row-level security') || error.message?.includes('permission denied')) {
          throw new Error('Access denied. Please ensure you have joined this event before entering rooms.');
        }
        throw error;
      }

      const room = rooms.find(r => r.id === roomId) || null;
      setSelectedRoom(room);
      await fetchRooms();
      toast({ title: 'Joined room', description: 'You can start chatting now.' });
    } catch (err: any) {
      console.error('Join room failed:', err);
      toast({ title: 'Join failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    }
  };

  const leaveRoom = async (roomId: string) => {
    if (!currentUser?.id) return;
    try {
      const { error } = await supabase.from('room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      if (selectedRoom?.id === roomId) setSelectedRoom(null);
      await fetchRooms();
      toast({ title: 'Left room', description: 'You have left the room.' });
    } catch (err: any) {
      toast({ title: 'Leave failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    }
  };

  const deleteRoom = async (roomId: string) => {
    if (!currentUser?.id) return;
    try {
      const { error } = await supabase.from('chat_rooms').delete().eq('id', roomId);
      if (error) throw error;
      if (selectedRoom?.id === roomId) setSelectedRoom(null);
      await fetchRooms();
      toast({ title: 'Room deleted', description: 'Room has been permanently deleted.' });
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    }
  };

  return {
    rooms,
    loading,
    participantCounts,
    selectedRoom,
    setSelectedRoom,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
    refresh: fetchRooms,
  };
};