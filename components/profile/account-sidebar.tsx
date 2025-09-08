'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Music, 
  Users, 
  Settings, 
  Calendar
} from "lucide-react";
import { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  role: 'admin' | 'user';
  created_at: string;
}

interface AccountSidebarProps {
  user: User;
  profile: UserProfile | null;
}

const navigationItems = [
  {
    href: '/protected/profile/account/venues',
    label: 'Your Venues',
    icon: MapPin,
    description: 'Favorite venues and visit history'
  },
  {
    href: '/protected/profile/account/artists',
    label: 'Your Artists',
    icon: Music,
    description: 'Followed artists and their events'
  },
  {
    href: '/protected/profile/account/friends',
    label: 'Friends',
    icon: Users,
    description: 'Friend connections and activity'
  },
  {
    href: '/protected/profile/account/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Account and privacy settings'
  }
];

export function AccountSidebar({ user, profile }: AccountSidebarProps) {
  const pathname = usePathname();
  
  const displayName = profile?.display_name || profile?.username || user.email || 'User';
  const username = profile?.username || user.id.substring(0, 8);
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
      {/* Profile Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {displayName}
            </h2>
            <p className="text-sm text-gray-500 truncate">
              @{username}
            </p>
            {profile?.role === 'admin' && (
              <Badge variant="secondary" className="mt-1 text-xs">
                Admin
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Access to Events Page */}
        <Link 
          href="/protected/profile/events"
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          View Events & Activity
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.description}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Member since {new Date(profile?.created_at || user.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          })}
        </p>
      </div>
    </div>
  );
}