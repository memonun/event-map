'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import {
  User as UserIcon,
  MapPin,
  Music,
  Users,
  Settings,
  Calendar,
  ArrowLeft,
  Heart,
  Star,
  Trophy,
  Clock,
  Edit
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YourVenuesSection } from '@/components/profile/your-venues-section';
import { YourArtistsSection } from '@/components/profile/your-artists-section';
import { FriendsManagementSection } from '@/components/profile/friends-management-section';
import { ActivitySection } from '@/components/profile/activity-section';

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  role: 'admin' | 'user';
  created_at: string;
  preferences: {
    favorite_venues: string[];
    followed_artists: string[];
    genres: string[];
  };
}

interface ProfilePanelProps {
  onBack: () => void;
}

export function ProfilePanel({ onBack }: ProfilePanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState('activity');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();

      try {
        // Get current user
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.error('Auth error:', authError);
          setLoading(false);
          return;
        }

        if (currentUser) {
          setUser(currentUser);

          // Try to get user profile
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            console.log('Creating user profile for:', currentUser.id);

            const newProfile: UserProfile = {
              id: currentUser.id,
              username: currentUser.email?.split('@')[0] || `user_${currentUser.id.slice(0, 8)}`,
              display_name: currentUser.user_metadata?.display_name || null,
              avatar_url: currentUser.user_metadata?.avatar_url || null,
              bio: null,
              location: null,
              role: 'user' as const,
              created_at: new Date().toISOString(),
              preferences: {
                favorite_venues: [],
                followed_artists: [],
                genres: []
              }
            };

            const { data: createdProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert([newProfile])
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
            } else {
              setProfile(createdProfile);
            }
          } else if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else {
            // Profile exists, ensure it has preferences
            const profileWithDefaults = {
              ...profileData,
              preferences: profileData.preferences || {
                favorite_venues: [],
                followed_artists: [],
                genres: []
              }
            };
            setProfile(profileWithDefaults);
          }
        }
      } catch (error) {
        console.error('Unexpected error in fetchUserData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="h-full bg-black flex items-center justify-center p-6">
        <div className="text-center text-zinc-400">
          <UserIcon className="w-16 h-16 mx-auto mb-4 opacity-40" />
          <h3 className="text-xl font-medium mb-3 text-zinc-300">Profile Not Found</h3>
          <p className="text-sm">Unable to load profile information</p>
        </div>
      </div>
    );
  }

  const getDisplayName = () => profile.display_name || profile.username || 'User';
  const getInitials = () => getDisplayName().charAt(0).toUpperCase();

  const navigationItems = [
    { id: 'activity', label: 'Activity', icon: Calendar },
    { id: 'venues', label: 'Venues', icon: MapPin },
    { id: 'artists', label: 'Artists', icon: Music },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderSection = () => {
    if (!user || !profile) return null;

    switch (activeSection) {
      case 'activity':
        return (
          <div className="bg-white min-h-full p-6">
            <ActivitySection userId={user.id} />
          </div>
        );
      case 'venues':
        return (
          <div className="bg-white min-h-full p-6">
            <YourVenuesSection userId={user.id} profile={profile} />
          </div>
        );
      case 'artists':
        return (
          <div className="bg-white min-h-full p-6">
            <YourArtistsSection userId={user.id} profile={profile} />
          </div>
        );
      case 'friends':
        return (
          <div className="bg-white min-h-full p-6">
            <FriendsManagementSection userId={user.id} />
          </div>
        );
      case 'settings':
        return (
          <div className="text-center text-zinc-400 py-12">
            <Settings className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p>Settings section - Coming soon</p>
          </div>
        );
      default:
        return (
          <div className="bg-white min-h-full p-6">
            <ActivitySection userId={user.id} />
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-black text-white overflow-y-auto scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
      {/* Header Section */}
      <div className="relative bg-gradient-to-b from-zinc-800 to-black p-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="pt-12 text-center">
          {/* Avatar */}
          <div className="w-24 h-24 mx-auto mb-4 relative">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={getDisplayName()}
                className="w-full h-full rounded-full object-cover border-4 border-zinc-700"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center border-4 border-zinc-700">
                <span className="text-white text-2xl font-bold">{getInitials()}</span>
              </div>
            )}
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black hover:bg-yellow-300 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          </div>

          {/* User Info */}
          <h1 className="text-2xl font-bold text-white mb-1">{getDisplayName()}</h1>
          <p className="text-zinc-400 mb-2">@{profile.username}</p>
          {profile.bio && (
            <p className="text-zinc-300 text-sm mb-3 max-w-xs mx-auto">{profile.bio}</p>
          )}
          {profile.location && (
            <div className="flex items-center justify-center gap-1 text-zinc-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-md border-b border-zinc-800 px-6 py-3 z-10">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-yellow-400 text-black'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {renderSection()}
      </div>
    </div>
  );
}