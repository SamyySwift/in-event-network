import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  iconGradient: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  itemCount?: number;
  className?: string;
  headerClassName?: string;
  actionButton?: React.ReactNode;
}

const STORAGE_KEY_PREFIX = 'dashboard_section_';

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  description,
  icon,
  iconGradient,
  children,
  defaultOpen = true,
  itemCount,
  className,
  headerClassName,
  actionButton,
}) => {
  // Initialize from localStorage synchronously to prevent layout shift
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
    return stored !== null ? stored === 'true' : defaultOpen;
  });

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, String(isOpen));
  }, [id, isOpen]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn('relative z-10', className)}>
      <CollapsibleTrigger asChild>
        <div
          className={cn(
            'flex items-center justify-between gap-4 mb-4 cursor-pointer group',
            'p-3 -m-3 rounded-xl hover:bg-muted/50 transition-colors duration-200',
            headerClassName
          )}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  'group-hover:scale-105 transition-transform duration-200',
                  iconGradient
                )}
              >
                {icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {title}
                </h2>
                {!isOpen && itemCount !== undefined && itemCount > 0 && (
                  <Badge variant="secondary" className="text-xs font-medium">
                    {itemCount}
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-muted-foreground text-sm truncate">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {actionButton && isOpen && (
              <div onClick={(e) => e.stopPropagation()}>{actionButton}</div>
            )}
            <div
              className={cn(
                'w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center',
                'group-hover:bg-muted transition-colors duration-200'
              )}
            >
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-muted-foreground transition-transform duration-300',
                  isOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </div>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

// Utility hook to manage all sections at once
export const useCollapsibleSections = (sectionIds: string[]) => {
  const collapseAll = () => {
    sectionIds.forEach((id) => {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, 'false');
    });
    window.dispatchEvent(new Event('storage'));
  };

  const expandAll = () => {
    sectionIds.forEach((id) => {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, 'true');
    });
    window.dispatchEvent(new Event('storage'));
  };

  return { collapseAll, expandAll };
};

export default CollapsibleSection;
