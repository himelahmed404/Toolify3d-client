import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Complete Your Profile',
  path: '/complete-profile',
  noindex: true,
});

export default function CompleteProfileLayout({ children }) {
  return children;
}
