'use client';

import React, { useState, useCallback } from 'react';
import { User, Settings, Moon, Sun, HelpCircle, Calendar } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ClientAuthButton } from '@/components/client-auth-button';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function FloatingUserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleMenu = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <div className="relative">
      {/* Brand Logo & Menu Button */}
      <div className="bg-white/95 backdrop-blur-sm border border-black/10 rounded-full shadow-lg flex items-center">
        {/* Brand */}
        <div className="flex items-center gap-2 px-4 py-3">
          <Calendar className="w-5 h-5 text-red-500" />
          <span className="font-bold text-gray-900 hidden sm:block">Event Map</span>
        </div>
        
        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMenu}
          className="rounded-full p-3 hover:bg-gray-100 transition-colors"
        >
          <User className="w-5 h-5 text-gray-600" />
        </Button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-sm border border-black/10 rounded-2xl shadow-xl z-50">
            <div className="p-4">
              {/* User Section */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <ClientAuthButton />
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                <Link 
                  href="/app/profile"
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-900">Profil</span>
                </Link>

                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-900">Açık tema</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-900">Koyu tema</span>
                    </>
                  )}
                </button>

                <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-900">Ayarlar</span>
                </button>

                <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors">
                  <HelpCircle className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-900">Yardım</span>
                </button>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">
                  Event Map v1.0
                  <br />
                  5,240+ etkinlik
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}