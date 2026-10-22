import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Reset Password',
  path: '/reset-password',
  noindex: true,
});

export default function ResetPasswordLayout({ children }) {
  return children;
}
