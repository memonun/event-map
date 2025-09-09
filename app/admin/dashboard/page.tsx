import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/auth/admin";
import { UserIcon, ShieldCheck } from "lucide-react";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // Check admin access
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 text-sm p-3 px-5 rounded-md text-red-800 flex gap-3 items-center justify-between">
          <div className="flex gap-3 items-center">
            <ShieldCheck size="16" strokeWidth={2} />
            This is an ADMIN-ONLY dashboard - only you can see this page
          </div>
          <div className="flex gap-2">
            <Link href="/admin/debug">
              <Button variant="outline" size="sm" className="text-red-700 border-red-300">
                Debug Tools
              </Button>
            </Link>
            <Link href="/protected/profile">
              <Button variant="outline" size="sm" className="text-red-700 border-red-300">
                <UserIcon size="16" className="mr-2" />
                My Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(data.claims, null, 2)}
        </pre>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
        <FetchDataSteps />
      </div>
    </div>
  );
}
