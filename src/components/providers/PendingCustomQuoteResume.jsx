'use client';

import { useApi } from '@/components/providers/ApiProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useResumePendingCustomQuote } from '@/lib/quote/useResumePendingCustomQuote';

export default function PendingCustomQuoteResume() {
  const { session, tokenReady, refreshCart } = useApi();
  const { showToast } = useToast();

  useResumePendingCustomQuote({ session, tokenReady, refreshCart, showToast });

  return null;
}
