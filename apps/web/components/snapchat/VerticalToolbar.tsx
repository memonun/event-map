'use client';

import React from 'react';
import {
  Home,
  User,
  Settings
} from 'lucide-react';

interface VerticalToolbarProps {
  activeItem: string;
  onItemChange: (item: string) => void;
}

interface ToolbarItem {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  color: string;
}

const toolbarItems: ToolbarItem[] = [
  {
    id: 'home',
    icon: Home,
    label: 'Home',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    id: 'profile',
    icon: User,
    label: 'Profile',
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    color: 'bg-gray-500 hover:bg-gray-600'
  }
];

export function VerticalToolbar({ activeItem, onItemChange }: VerticalToolbarProps) {
  return (
    <div className="flex flex-col gap-3 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/20">
      {toolbarItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onItemChange(item.id)}
            className={`
              relative w-12 h-12 rounded-full flex items-center justify-center
              transition-all duration-200 ease-out
              group
              ${isActive
                ? `${item.color} scale-110 shadow-lg`
                : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
              }
            `}
            title={item.label}
          >
            <Icon
              className={`w-5 h-5 transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'
              }`}
            />

            {/* Active indicator */}
            {isActive && (
              <div className="absolute -right-1 -top-1 w-3 h-3 bg-white rounded-full border-2 border-current" />
            )}

            {/* Tooltip on hover */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {item.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}