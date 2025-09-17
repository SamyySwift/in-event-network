
import React from 'react';
import { Quote } from 'lucide-react';

export function QuotedMessage({ message, compact = false }: { message: any; compact?: boolean }) {
  return (
    <div className={`border-l-4 border-blue-500 pl-3 ${compact ? 'py-1' : 'py-2'} bg-gray-50 dark:bg-gray-800 rounded-r-lg`}>
      <div className="flex items-center gap-2 mb-1">
        <Quote className="h-3 w-3 text-blue-500" />
        <span className={`font-medium text-blue-700 dark:text-blue-300 ${compact ? 'text-xs' : 'text-sm'}`}>
          {message.user_profile?.name || "Admin"}
        </span>
      </div>
      <p className={`text-gray-600 dark:text-gray-300 ${compact ? 'text-xs' : 'text-sm'} line-clamp-2`}>
        {message.content}
      </p>
    </div>
  );
}
