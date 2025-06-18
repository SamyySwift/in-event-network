
import React, { createContext, useContext, ReactNode } from 'react';
import { useAttendeeContext } from '@/hooks/useAttendeeContext';

interface AttendeeEventContextType {
  currentEventId: string | null;
  hostId: string | null;
  hostEvents: string[];
  isLoading: boolean;
  error: any;
  hasJoinedEvent: boolean;
}

const AttendeeEventContext = createContext<AttendeeEventContextType | undefined>(undefined);

export const AttendeeEventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { context, isLoading, error } = useAttendeeContext();

  console.log('AttendeeEventContext - context:', context);
  console.log('AttendeeEventContext - isLoading:', isLoading);
  console.log('AttendeeEventContext - error:', error);

  const value: AttendeeEventContextType = {
    currentEventId: context?.currentEventId || null,
    hostId: context?.hostId || null,
    hostEvents: context?.hostEvents || [],
    isLoading,
    error,
    hasJoinedEvent: !!context?.currentEventId && !!context?.hostId,
  };

  console.log('AttendeeEventContext - providing value:', value);

  return (
    <AttendeeEventContext.Provider value={value}>
      {children}
    </AttendeeEventContext.Provider>
  );
};

export const useAttendeeEventContext = () => {
  const context = useContext(AttendeeEventContext);
  if (context === undefined) {
    throw new Error('useAttendeeEventContext must be used within an AttendeeEventProvider');
  }
  return context;
};
