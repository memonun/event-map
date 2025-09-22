import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { YourVenuesSection } from "@/components/profile/your-venues-section";

export default async function VenuesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Get user profile with preferences
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Venues</h1>
        <p className="text-gray-600 mt-1">
          Manage your favorite venues and discover new places for events
        </p>
      </div>

      {/* Venues Section */}
      <YourVenuesSection userId={user.id} profile={profile} />
    </div>
  );
}