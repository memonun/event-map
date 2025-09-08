"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserProfile } from "@/lib/types/database";
import type { User } from "@supabase/supabase-js";

interface UserProfileFormProps {
  user: User;
  profile: UserProfile | null;
}

export function UserProfileForm({ user, profile }: UserProfileFormProps) {
  const [formData, setFormData] = useState({
    username: profile?.username || user.email?.split('@')[0] || '',
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username && formData.username !== profile?.username) {
        try {
          const response = await fetch(`/api/profile/username-check?username=${formData.username}`);
          const result = await response.json();
          setUsernameAvailable(result.available);
        } catch (_error) {
          setUsernameAvailable(false);
        }
      } else {
        setUsernameAvailable(null);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username, profile?.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const method = profile ? 'PUT' : 'POST';
      const response = await fetch('/api/profile', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {profile ? 'Update Profile' : 'Complete Your Profile'}
        </CardTitle>
        <CardDescription>
          {profile 
            ? 'Update your profile information and preferences' 
            : 'Set up your profile to get started with social features'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                placeholder="your-username"
                required
                value={formData.username}
                onChange={handleInputChange('username')}
                className={
                  usernameAvailable === false 
                    ? "border-red-500" 
                    : usernameAvailable === true 
                    ? "border-green-500" 
                    : ""
                }
              />
              {usernameAvailable === false && (
                <p className="text-sm text-red-500">Username is already taken</p>
              )}
              {usernameAvailable === true && (
                <p className="text-sm text-green-500">Username is available</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                type="text"
                placeholder="Your display name"
                value={formData.display_name}
                onChange={handleInputChange('display_name')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell others about yourself..."
                value={formData.bio}
                onChange={handleInputChange('bio')}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="Istanbul, Turkey"
                value={formData.location}
                onChange={handleInputChange('location')}
              />
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Account Information</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here. Use account settings in Supabase.
              </p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-md bg-green-50 border border-green-200">
              <p className="text-sm text-green-600">Profile updated successfully!</p>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || (usernameAvailable === false)}
          >
            {isLoading 
              ? 'Saving...' 
              : profile 
              ? 'Update Profile' 
              : 'Create Profile'
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}