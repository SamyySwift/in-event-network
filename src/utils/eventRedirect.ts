/**
 * Utility functions for handling event joining and redirects
 */

export interface EventRedirectConfig {
  accessCode?: string;
  redirectAfterLogin?: string;
  defaultRole?: 'host' | 'attendee';
}

/**
 * Store event context for later use (after authentication)
 */
export const storeEventContext = (config: EventRedirectConfig) => {
  console.log('eventRedirect: Storing event context:', config);
  
  if (config.accessCode) {
    sessionStorage.setItem('pendingEventCode', config.accessCode);
  }
  
  if (config.redirectAfterLogin) {
    localStorage.setItem('redirectAfterLogin', config.redirectAfterLogin);
  }
};

/**
 * Get stored event context
 */
export const getStoredEventContext = (): EventRedirectConfig => {
  const pendingEventCode = sessionStorage.getItem('pendingEventCode');
  const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
  
  const context = {
    accessCode: pendingEventCode || undefined,
    redirectAfterLogin: redirectAfterLogin || undefined,
  };
  
  console.log('eventRedirect: Retrieved stored event context:', context);
  return context;
};

/**
 * Clear stored event context
 */
export const clearEventContext = () => {
  console.log('eventRedirect: Clearing event context');
  sessionStorage.removeItem('pendingEventCode');
  localStorage.removeItem('redirectAfterLogin');
};

/**
 * Get the appropriate redirect path based on user role and context
 */
export const getRedirectPath = (userRole: 'host' | 'attendee', eventContext?: EventRedirectConfig): string => {
  console.log('eventRedirect: Getting redirect path for role:', userRole, 'context:', eventContext);
  
  // Check for ticket purchase redirect first
  if (eventContext?.redirectAfterLogin?.includes('/buy-tickets/')) {
    console.log('eventRedirect: Redirecting to ticket purchase:', eventContext.redirectAfterLogin);
    return eventContext.redirectAfterLogin;
  }
  
  // Default role-based redirect
  const defaultPath = userRole === 'host' ? '/admin' : '/attendee';
  console.log('eventRedirect: Using default path:', defaultPath);
  return defaultPath;
};

/**
 * Check if we have a pending event to join
 */
export const hasPendingEvent = (): boolean => {
  const pendingEventCode = sessionStorage.getItem('pendingEventCode');
  const hasPending = !!pendingEventCode;
  console.log('eventRedirect: Has pending event:', hasPending, 'code:', pendingEventCode);
  return hasPending;
};