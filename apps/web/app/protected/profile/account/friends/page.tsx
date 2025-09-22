import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FriendsManagementSection } from "@/components/profile/friends-management-section";

export default async function FriendsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
        <p className="text-gray-600 mt-1">
          Connect with other event enthusiasts and share your experiences
        </p>
      </div>

      {/* Friends Section */}
      <FriendsManagementSection userId={user.id} />
    </div>
  );
}