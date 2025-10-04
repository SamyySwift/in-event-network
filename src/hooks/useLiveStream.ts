import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LiveStream {
  id: string;
  event_id: string;
  host_id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

interface StreamMessage {
  id: string;
  stream_id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    name: string;
    photo_url: string | null;
  };
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

export const useLiveStream = (eventId: string | null) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  console.log('useLiveStream - eventId:', eventId);
  console.log('useLiveStream - currentUser:', currentUser?.id);

  // Fetch active stream
  const fetchActiveStream = useCallback(async () => {
    if (!eventId) {
      console.log('useLiveStream - no eventId, skipping fetch');
      setLoading(false);
      return;
    }
    
    console.log('useLiveStream - fetching stream for eventId:', eventId);
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('useLiveStream - error fetching stream:', error);
        throw error;
      }
      console.log('useLiveStream - fetched stream:', data);
      setActiveStream(data);
    } catch (error) {
      console.error('Error fetching stream:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Fetch messages
  const fetchMessages = useCallback(async (streamId: string) => {
    try {
      const { data, error } = await supabase
        .from('live_stream_messages')
        .select('*, profiles:user_id(name, photo_url)')
        .eq('stream_id', streamId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (streamId: string, message: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('live_stream_messages')
        .insert({
          stream_id: streamId,
          user_id: currentUser.id,
          message,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  }, [currentUser, toast]);

  // Start broadcasting (Admin)
  const startBroadcast = useCallback(async (title: string, description?: string) => {
    if (!currentUser) return;

    try {
      // Create stream record
      const { data: stream, error: streamError } = await supabase
        .from('live_streams')
        .insert({
          event_id: eventId,
          host_id: currentUser.id,
          title,
          description,
          is_active: true,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (streamError) throw streamError;

      // Get user media
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      // Create peer connection
      peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

      // Add local stream tracks
      localStream.current.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, localStream.current!);
      });

      // Handle ICE candidates
      peerConnection.current.onicecandidate = async (event) => {
        if (event.candidate) {
          await supabase.from('live_stream_signals').insert({
            stream_id: stream.id,
            user_id: currentUser.id,
            signal_type: 'ice-candidate',
            signal_data: event.candidate,
          });
        }
      };

      // Create and send offer
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      await supabase.from('live_stream_signals').insert({
        stream_id: stream.id,
        user_id: currentUser.id,
        signal_type: 'offer',
        signal_data: offer,
      });

      setActiveStream(stream);
      setBroadcasting(true);
      
      toast({
        title: 'Broadcast Started',
        description: 'You are now live!',
      });

      return localStream.current;
    } catch (error) {
      console.error('Error starting broadcast:', error);
      toast({
        title: 'Error',
        description: 'Failed to start broadcast',
        variant: 'destructive',
      });
    }
  }, [currentUser, eventId, toast]);

  // Stop broadcasting
  const stopBroadcast = useCallback(async () => {
    if (!activeStream) return;

    try {
      // Stop all tracks
      localStream.current?.getTracks().forEach(track => track.stop());
      peerConnection.current?.close();

      // Update stream record
      await supabase
        .from('live_streams')
        .update({
          is_active: false,
          ended_at: new Date().toISOString(),
        })
        .eq('id', activeStream.id);

      setActiveStream(null);
      setBroadcasting(false);
      
      toast({
        title: 'Broadcast Ended',
        description: 'Stream has been stopped',
      });
    } catch (error) {
      console.error('Error stopping broadcast:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop broadcast',
        variant: 'destructive',
      });
    }
  }, [activeStream, toast]);

  // Join stream as viewer
  const joinStream = useCallback(async (streamId: string, videoElement: HTMLVideoElement) => {
    if (!currentUser) return;

    try {
      // Create peer connection
      peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

      // Handle incoming tracks
      peerConnection.current.ontrack = (event) => {
        videoElement.srcObject = event.streams[0];
      };

      // Listen for host's offer
      const channel = supabase
        .channel(`stream-${streamId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'live_stream_signals',
            filter: `stream_id=eq.${streamId}`,
          },
          async (payload) => {
            const signal = payload.new;
            
            if (signal.signal_type === 'offer' && signal.user_id !== currentUser.id) {
              await peerConnection.current?.setRemoteDescription(signal.signal_data);
              const answer = await peerConnection.current?.createAnswer();
              await peerConnection.current?.setLocalDescription(answer);

              await supabase.from('live_stream_signals').insert({
                stream_id: streamId,
                user_id: currentUser.id,
                signal_type: 'answer',
                signal_data: answer,
              });
            } else if (signal.signal_type === 'ice-candidate' && signal.user_id !== currentUser.id) {
              await peerConnection.current?.addIceCandidate(signal.signal_data);
            }
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    } catch (error) {
      console.error('Error joining stream:', error);
      toast({
        title: 'Error',
        description: 'Failed to join stream',
        variant: 'destructive',
      });
    }
  }, [currentUser, toast]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!eventId) {
      console.log('useLiveStream - no eventId, skipping subscription');
      setLoading(false);
      return;
    }

    console.log('useLiveStream - setting up realtime subscription for:', eventId);
    fetchActiveStream();

    const channel = supabase
      .channel(`live-stream-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_streams',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setActiveStream(payload.new as LiveStream);
          } else if (payload.eventType === 'DELETE') {
            setActiveStream(null);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [eventId, fetchActiveStream]);

  // Subscribe to messages
  useEffect(() => {
    if (!activeStream) return;

    fetchMessages(activeStream.id);

    const channel = supabase
      .channel(`messages-${activeStream.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_stream_messages',
          filter: `stream_id=eq.${activeStream.id}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as StreamMessage]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [activeStream, fetchMessages]);

  return {
    activeStream,
    messages,
    loading,
    broadcasting,
    startBroadcast,
    stopBroadcast,
    joinStream,
    sendMessage,
  };
};
