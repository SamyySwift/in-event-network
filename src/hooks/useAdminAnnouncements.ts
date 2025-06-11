
import { useAdminEventContext } from './useAdminEventContext';
import { useAnnouncements } from './useAnnouncements';

export const useAdminAnnouncements = () => {
  const { selectedEventId } = useAdminEventContext();
  return useAnnouncements(selectedEventId || undefined);
};
