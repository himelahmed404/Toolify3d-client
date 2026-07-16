import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Create Account',
  path: '/register',
  noindex: true,
});

export default function RegisterLayout({ children }) {
  return children;
}
