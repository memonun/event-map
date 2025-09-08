import { redirect } from "next/navigation";

export default function ProfilePage() {
  // Redirect to account page as the main profile destination
  redirect("/protected/profile/account");
}