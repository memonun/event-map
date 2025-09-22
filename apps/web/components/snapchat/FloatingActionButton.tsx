'use client';

import React, { useState, useEffect } from 'react';
import { Plus, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
}

export function FloatingActionButton() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          display_name: authUser.user_metadata?.display_name,
          avatar_url: authUser.user_metadata?.avatar_url
        });
      }
    };

    getUser();
  }, [supabase]);

  const getInitials = (name: string | undefined, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-red-400', 'bg-blue-400', 'bg-green-400',
      'bg-yellow-400', 'bg-purple-400', 'bg-pink-400',
      'bg-indigo-400', 'bg-orange-400'
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (!user) {
    return (
      <button className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center shadow-lg border-4 border-white hover:scale-105 transition-transform duration-200">
        <User className="w-6 h-6 text-gray-600" />
      </button>
    );
  }

  return (
    <div className="relative">
      {/* Main Avatar Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white hover:scale-105 transition-transform duration-200 overflow-hidden"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.display_name || user.email}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(user.id)}`}>
            {getInitials(user.display_name, user.email)}
          </div>
        )}

        {/* Online Status Indicator */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
      </button>

      {/* Quick Action Menu */}
      {isMenuOpen && (
        <div className="absolute bottom-16 left-0 bg-white/90 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/20 min-w-[200px]">
          <div className="flex flex-col gap-1">
            {/* User Info Header */}
            <div className="px-3 py-2 border-b border-gray-200/50">
              <p className="font-medium text-gray-900 text-sm">
                {user.display_name || 'User'}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>

            {/* Quick Actions */}
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Add Event</span>
            </button>

            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">My Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}