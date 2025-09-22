import { redirect } from 'next/navigation';

export default function SnapchatPage() {
  // Redirect to main page since Snapchat layout is now the default
  redirect('/');
}