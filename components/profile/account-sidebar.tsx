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
  Calendar,
  Map,
  ArrowLeft
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
    <div className="w-80 bg-card rounded-lg shadow-sm border border-border h-fit">
      {/* Profile Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {displayName}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              @{username}
            </p>
            {profile?.role === 'admin' && (
              <Badge variant="secondary" className="mt-1 text-xs">
                Admin
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Access Links */}
        <div className="space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors font-medium"
          >
            <Map className="w-4 h-4" />
            Back to Event Map
          </Link>

          <Link
            href="/protected/profile/events"
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            View Events & Activity
          </Link>
        </div>
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
                      ? 'bg-accent text-accent-foreground border border-border'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${isActive ? 'text-accent-foreground' : 'text-foreground'}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
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
      <div className="p-4 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Member since {new Date(profile?.created_at || user.created_at).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
}