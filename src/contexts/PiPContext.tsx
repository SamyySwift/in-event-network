import React, { createContext, useContext, useState, useCallback } from 'react';

type StreamType = 'youtube' | 'jitsi' | null;

interface PiPContextType {
  isVisible: boolean;
  eventId: string | null;
  isFullscreen: boolean;
  streamType: StreamType;
  jitsiRoomName: string | null;
  sessionId: number;
  showPiP: (eventId: string) => void;
  showJitsiPiP: (eventId: string, roomName: string) => void;
  hidePiP: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  reconnect: () => void;
}

const PiPContext = createContext<PiPContextType | undefined>(undefined);

export const PiPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streamType, setStreamType] = useState<StreamType>(null);
  const [jitsiRoomName, setJitsiRoomName] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(1);

  // Force iframe reconnect by incrementing session ID
  const reconnect = useCallback(() => {
    setSessionId(prev => prev + 1);
    console.log('Jitsi reconnect triggered');
  }, []);

  // Show YouTube PiP
  const showPiP = useCallback((id: string) => {
    setEventId(id);
    setIsVisible(true);
    setIsFullscreen(false);
    setStreamType('youtube');
    setJitsiRoomName(null);
  }, []);

  // Show Jitsi PiP
  const showJitsiPiP = useCallback((id: string, roomName: string) => {
    setEventId(id);
    setJitsiRoomName(roomName);
    setIsVisible(true);
    setIsFullscreen(false);
    setStreamType('jitsi');
  }, []);

  const hidePiP = useCallback(() => {
    setIsVisible(false);
    setEventId(null);
    setIsFullscreen(false);
    setStreamType(null);
    setJitsiRoomName(null);
  }, []);

  const setFullscreen = useCallback((fullscreen: boolean) => {
    setIsFullscreen(fullscreen);
  }, []);

  return (
    <PiPContext.Provider value={{ 
      isVisible, 
      eventId, 
      isFullscreen, 
      streamType,
      jitsiRoomName,
      sessionId,
      showPiP, 
      showJitsiPiP,
      hidePiP, 
      setFullscreen,
      reconnect
    }}>
      {children}
    </PiPContext.Provider>
  );
};

export const usePiP = () => {
  const context = useContext(PiPContext);
  if (context === undefined) {
    throw new Error('usePiP must be used within a PiPProvider');
  }
  return context;
};
