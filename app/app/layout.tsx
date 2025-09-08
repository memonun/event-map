import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, User } from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Home size="20" />
                <span className="font-bold text-lg">Event Map</span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-4">
                <Link 
                  href="/app/profile" 
                  className="text-sm hover:text-primary transition-colors"
                >
                  Profile
                </Link>
                <Link 
                  href="/app/events" 
                  className="text-sm hover:text-primary transition-colors"
                >
                  My Events
                </Link>
                <Link 
                  href="/app/social" 
                  className="text-sm hover:text-primary transition-colors"
                >
                  Friends
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/app/profile">
                <Button variant="ghost" size="sm">
                  <User size="16" className="mr-2" />
                  {user.email}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 container mx-auto px-4 py-8">
        {children}
      </div>
    </main>
  );
}