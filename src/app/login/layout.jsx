import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Log In',
  path: '/login',
  noindex: true,
});

export default function LoginLayout({ children }) {
  return children;
}
