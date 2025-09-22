import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { YourArtistsSection } from "@/components/profile/your-artists-section";

export default async function ArtistsPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Your Artists</h1>
        <p className="text-gray-600 mt-1">
          Follow your favorite artists and stay updated on their upcoming events
        </p>
      </div>

      {/* Artists Section */}
      <YourArtistsSection userId={user.id} profile={profile} />
    </div>
  );
}