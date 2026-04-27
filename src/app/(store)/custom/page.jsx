import { redirect } from 'next/navigation';

// Old /custom route redirects to the integrated shop category
export default function CustomRedirectPage() {
  redirect('/shop/custom-creations');
}
