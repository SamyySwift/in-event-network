import React, { createContext, useContext, useState, useCallback } from 'react';

interface PiPContextType {
  isVisible: boolean;
  eventId: string | null;
  isFullscreen: boolean;
  showPiP: (eventId: string) => void;
  hidePiP: () => void;
  setFullscreen: (fullscreen: boolean) => void;
}

const PiPContext = createContext<PiPContextType | undefined>(undefined);

export const PiPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const showPiP = useCallback((id: string) => {
    setEventId(id);
    setIsVisible(true);
    setIsFullscreen(false);
  }, []);

  const hidePiP = useCallback(() => {
    setIsVisible(false);
    setEventId(null);
    setIsFullscreen(false);
  }, []);

  const setFullscreen = useCallback((fullscreen: boolean) => {
    setIsFullscreen(fullscreen);
  }, []);

  return (
    <PiPContext.Provider value={{ isVisible, eventId, isFullscreen, showPiP, hidePiP, setFullscreen }}>
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
