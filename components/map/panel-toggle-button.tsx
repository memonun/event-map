'use client';

import React from 'react';
import { List, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PanelToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
  eventCount?: number;
}

export function PanelToggleButton({ isOpen, onClick, eventCount }: PanelToggleButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-30 
        rounded-full w-14 h-14 shadow-lg hover:shadow-xl
        transition-all duration-300 ease-out
        ${isOpen 
          ? 'bg-gray-600 hover:bg-gray-700 text-white' 
          : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
        }
      `}
      size="sm"
    >
      <div className="flex flex-col items-center justify-center">
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <List className="w-5 h-5" />
            {eventCount !== undefined && (
              <span className="text-xs font-medium mt-0.5">
                {eventCount > 999 ? '999+' : eventCount}
              </span>
            )}
          </>
        )}
      </div>
    </Button>
  );
}