import React, { createContext, useContext, useEffect, useState } from 'react';

interface NetworkContextType {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string | null;
  effectiveType: string | null;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isSlowConnection: false,
  connectionType: null,
  effectiveType: null,
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionInfo, setConnectionInfo] = useState<{
    isSlowConnection: boolean;
    connectionType: string | null;
    effectiveType: string | null;
  }>({
    isSlowConnection: false,
    connectionType: null,
    effectiveType: null,
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection quality
    const updateConnectionInfo = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        const isSlowConnection = ['slow-2g', '2g', '3g'].includes(effectiveType);
        
        setConnectionInfo({
          isSlowConnection,
          connectionType: connection.type || null,
          effectiveType,
        });
      }
    };

    updateConnectionInfo();

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo);
      }
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, ...connectionInfo }}>
      {children}
    </NetworkContext.Provider>
  );
};
