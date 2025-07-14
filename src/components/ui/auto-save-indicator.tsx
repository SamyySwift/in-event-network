
import React, { useEffect, useState } from 'react';
import { Check, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  isSaving?: boolean;
  lastSaved?: Date | null;
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isSaving = false,
  lastSaved = null,
  className
}) => {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!isSaving && lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn("flex items-center space-x-2 text-sm text-muted-foreground", className)}>
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </>
      ) : showSaved ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-green-600">Saved</span>
        </>
      ) : lastSaved ? (
        <>
          <Save className="h-4 w-4" />
          <span>Last saved at {formatTime(lastSaved)}</span>
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          <span>Auto-save enabled</span>
        </>
      )}
    </div>
  );
};
