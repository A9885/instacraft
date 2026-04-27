import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Simple redirect to the actual dashboard
  redirect('/admin/dashboard');
}
