import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Forgot Password',
  path: '/forgot-password',
  noindex: true,
});

export default function ForgotPasswordLayout({ children }) {
  return children;
}
