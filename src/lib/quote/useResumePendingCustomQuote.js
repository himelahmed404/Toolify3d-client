'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCustomOrderFile,
  clearCustomOrderFile,
  PENDING_CUSTOM_FILE_KEY,
} from '@/lib/quote/customOrderFileStore';
import { addCustomQuoteToCart } from '@/lib/quote/addCustomToCart';
import { PENDING_CUSTOM_QUOTE_KEY } from '@/components/home/QuoteCalculator';

export function useResumePendingCustomQuote({ session, tokenReady, refreshCart, showToast }) {
  const router = useRouter();
  const resumeAttemptedRef = useRef(false);

  useEffect(() => {
    if (!session?.user || !tokenReady || resumeAttemptedRef.current) return;

    const raw = sessionStorage.getItem(PENDING_CUSTOM_QUOTE_KEY);
    if (!raw) return;

    resumeAttemptedRef.current = true;

    async function resumePendingQuote() {
      try {
        const quoteData = JSON.parse(raw);
        const file = await getCustomOrderFile(PENDING_CUSTOM_FILE_KEY);
        if (!file) {
          sessionStorage.removeItem(PENDING_CUSTOM_QUOTE_KEY);
          return;
        }

        const fileName = await addCustomQuoteToCart(session.user.id, file, quoteData);
        await clearCustomOrderFile(PENDING_CUSTOM_FILE_KEY);
        sessionStorage.removeItem(PENDING_CUSTOM_QUOTE_KEY);
        await refreshCart();
        showToast?.(`${fileName} added to cart.`, 'success');
        router.push('/dashboard');
      } catch (err) {
        showToast?.(err.message || 'Failed to add custom project to cart.', 'error');
      }
    }

    resumePendingQuote();
  }, [session, tokenReady, refreshCart, showToast, router]);
}
