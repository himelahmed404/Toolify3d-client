import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Dashboard',
  path: '/dashboard',
  noindex: true,
});

export default function DashboardLayout({ children }) {
  return children;
}
