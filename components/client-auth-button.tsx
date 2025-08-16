'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from '@supabase/supabase-js';

export function ClientAuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-600">Yükleniyor...</span>
      </div>
    );
  }

  return user ? (
    <div className="space-y-3">
      <div className="text-sm text-gray-900">
        Merhaba, <span className="font-medium">{user.email}</span>!
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="w-full justify-start px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4 mr-3 text-gray-600" />
        <span className="text-sm text-gray-900">Çıkış yap</span>
      </Button>
    </div>
  ) : (
    <div className="space-y-2">
      <Button asChild size="sm" variant="default" className="w-full bg-red-500 hover:bg-red-600">
        <Link href="/auth/login">Giriş yap</Link>
      </Button>
      <Button asChild size="sm" variant="outline" className="w-full">
        <Link href="/auth/sign-up">Kayıt ol</Link>
      </Button>
    </div>
  );
}