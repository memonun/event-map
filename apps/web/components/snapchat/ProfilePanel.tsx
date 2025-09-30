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
    let timeoutId: NodeJS.Timeout;
    let isDestroyed = false;

    const fetchUserData = async () => {
      const startTime = Date.now();
      console.log('ProfilePanel: Starting fetchUserData at', startTime);

      try {
        // Set up timeout
        timeoutId = setTimeout(() => {
          console.error('ProfilePanel: Auth check timeout after 5 seconds');
          if (!isDestroyed) setLoading(false);
        }, 5000);

        // Use lightweight auth-check endpoint for faster authentication verification
        const authCheckStart = Date.now();
        console.log('ProfilePanel: Checking authentication...');
        const response = await fetch('/api/profile/auth-check');
        const authCheckEnd = Date.now();
        console.log('ProfilePanel: Auth check completed in', authCheckEnd - authCheckStart, 'ms');

        if (response.status === 401) {
          console.log('ProfilePanel: User not authenticated');
          clearTimeout(timeoutId);
          if (!isDestroyed) setLoading(false);
          return;
        }

        if (!response.ok) {
          console.error('ProfilePanel: Auth check error:', response.status, response.statusText);
          clearTimeout(timeoutId);
          if (!isDestroyed) setLoading(false);
          return;
        }

        const authData = await response.json();
        console.log('ProfilePanel: User is authenticated, creating Supabase client...');

        // If auth check succeeds, we can safely use Supabase
        const supabaseStart = Date.now();
        const supabase = createClient();
        console.log('ProfilePanel: Supabase client created in', Date.now() - supabaseStart, 'ms');

        const getUserStart = Date.now();
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        const getUserEnd = Date.now();
        console.log('ProfilePanel: supabase.auth.getUser() completed in', getUserEnd - getUserStart, 'ms');

        if (authError || !currentUser) {
          console.error('ProfilePanel: Failed to get user after API auth check:', authError);
          clearTimeout(timeoutId);
          if (!isDestroyed) setLoading(false);
          return;
        }

        if (currentUser) {
          setUser(currentUser);

          // Try to get user profile
          const profileQueryStart = Date.now();
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          const profileQueryEnd = Date.now();
          console.log('ProfilePanel: user_profiles query completed in', profileQueryEnd - profileQueryStart, 'ms');

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            console.log('ProfilePanel: Creating user profile for:', currentUser.id);

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

            const profileInsertStart = Date.now();
            const { data: createdProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert([newProfile])
              .select()
              .single();
            const profileInsertEnd = Date.now();
            console.log('ProfilePanel: Profile insert completed in', profileInsertEnd - profileInsertStart, 'ms');

            if (createError) {
              console.error('Error creating profile:', createError);
              clearTimeout(timeoutId);
              if (!isDestroyed) setLoading(false);
              return;
            } else {
              setProfile(createdProfile);
            }
          } else if (profileError) {
            console.error('Error fetching profile:', profileError);
            clearTimeout(timeoutId);
            if (!isDestroyed) setLoading(false);
            return;
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

        // Set loading to false when everything succeeds
        const totalTime = Date.now() - startTime;
        console.log('ProfilePanel: Total fetchUserData completed in', totalTime, 'ms');
        clearTimeout(timeoutId);
        if (!isDestroyed) setLoading(false);
      } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error('ProfilePanel: Unexpected error in fetchUserData after', totalTime, 'ms:', error);
        clearTimeout(timeoutId);
        if (!isDestroyed) setLoading(false);
      }
    };

    fetchUserData();

    // Cleanup function
    return () => {
      isDestroyed = true;
      clearTimeout(timeoutId);
    };
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
          <h3 className="text-xl font-medium mb-3 text-zinc-300">Login Required</h3>
          <p className="text-sm mb-6">Please log in to view your profile</p>
          <div className="flex flex-col gap-3">
            <a
              href="/auth/login"
              className="px-6 py-3 bg-yellow-400 text-black rounded-full font-medium hover:bg-yellow-300 transition-colors text-center"
            >
              Login
            </a>
            <a
              href="/auth/sign-up"
              className="px-6 py-3 bg-transparent border border-zinc-600 text-zinc-300 rounded-full font-medium hover:bg-zinc-800 transition-colors text-center"
            >
              Sign Up
            </a>
            <button
              onClick={onBack}
              className="px-4 py-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
            >
              Go Back
            </button>
          </div>
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