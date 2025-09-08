import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ResizableFriendsSidebar } from "@/components/profile/resizable-friends-sidebar";
import { FutureEventsSection } from "@/components/profile/future-events-section";
import { ActivitySection } from "@/components/profile/activity-section";

export default async function ProfileEventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Profile Header */}
      <ProfileHeader user={user} profile={profile} />

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Resizable Friends Sidebar */}
          <ResizableFriendsSidebar userId={user.id} />

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Future Events Section */}
            <FutureEventsSection userId={user.id} />

            {/* Activity History Section */}
            <ActivitySection userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}