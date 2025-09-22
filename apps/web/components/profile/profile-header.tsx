'use client';

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Settings } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
}

interface ProfileHeaderProps {
  user: User;
  profile: UserProfile | null;
}

export function ProfileHeader({ user, profile }: ProfileHeaderProps) {
  const displayName = profile?.display_name || profile?.username || user.email || 'User';
  const username = profile?.username || user.id.substring(0, 8);
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 md:w-32 md:h-32">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-2xl md:text-3xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {displayName}
              </h1>
              <p className="text-gray-600">@{username}</p>
              
              {/* Location */}
              {profile?.location && (
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile.location}</span>
                </div>
              )}
              
              {/* Member Since */}
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Member since {new Date(profile?.created_at || user.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-1 flex justify-end">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <div className="mt-6 max-w-2xl">
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Stats Bar */}
        <div className="mt-8 flex flex-wrap gap-6">
          <StatCard 
            icon={<Calendar className="w-5 h-5" />}
            label="Events Attended"
            value="0"
            subtext="This year"
          />
          <StatCard 
            icon={<Users className="w-5 h-5" />}
            label="Friends"
            value="0"
            subtext="Connected"
          />
          <StatCard 
            icon={<MapPin className="w-5 h-5" />}
            label="Venues Visited"
            value="0"
            subtext="Unique venues"
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}

function StatCard({ icon, label, value, subtext }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 min-w-[160px]">
      <div className="text-blue-600">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-500">{subtext}</p>
      </div>
    </div>
  );
}