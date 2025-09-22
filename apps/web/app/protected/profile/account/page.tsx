import { redirect } from "next/navigation";

export default function AccountPage() {
  // Default to venues section
  redirect("/protected/profile/account/venues");
}