import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserProfileForm } from "@/components/user-profile-form";

export default async function UserProfilePage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  // Try to get existing profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile information and preferences
        </p>
      </div>
      
      <UserProfileForm 
        user={user} 
        profile={profile} 
      />
    </div>
  );
}