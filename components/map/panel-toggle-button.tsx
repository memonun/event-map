'use client';

import React from 'react';
import { List, ChevronRight } from 'lucide-react';
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
        fixed top-20 left-6 z-30 
        rounded-full w-14 h-14 shadow-lg hover:shadow-xl
        transition-all duration-300 ease-out
        ${isOpen 
          ? 'bg-gray-600 hover:bg-gray-700 text-white' 
          : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 hover:border-gray-400'
        }
      `}
      size="sm"
    >
      <div className="flex flex-col items-center justify-center">
        {isOpen ? (
          <>
            <List className="w-5 h-5" />
            {eventCount !== undefined && (
              <span className="text-xs font-medium mt-0.5">
                {eventCount > 999 ? '999+' : eventCount}
              </span>
            )}
          </>
        ) : (
          <ChevronRight className="w-6 h-6 text-gray-800" />
        )}
      </div>
    </Button>
  );
}