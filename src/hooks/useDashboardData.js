'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApi } from '@/components/providers/ApiProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { apiFetch, clearAccessToken } from '@/lib/api/client';
import { authClient } from '@/lib/auth-client';
import { hasPhoneNumber } from '@/lib/auth/phone';
import { loginPath } from '@/lib/auth-redirect';
import {
  mapCartItemFromApi,
  mapOrderForDisplay,
  mapCustomOrderForDisplay,
} from '@/lib/dashboard/mappers';

const EMPTY_PROFILE = {
  imageUrl: '',
  name: '',
  phone: '',
  address: '',
};

function mergeOrders(ordersData, customData) {
  return [
    ...ordersData.map(mapOrderForDisplay),
    ...customData.map(mapCustomOrderForDisplay),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function matchesCartItem(item, productId, customText = '', colorHex = '') {
  return (
    item.itemType !== 'custom' &&
    item.productId === productId &&
    (item.customText || '') === (customText || '') &&
    (item.color?.hex || '').toLowerCase() === (colorHex || '').toLowerCase()
  );
}

function buildCartItemQuery(customText = '', colorHex = '') {
  const params = new URLSearchParams();
  if (customText) params.set('customText', customText);
  if (colorHex) params.set('colorHex', colorHex);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function useDashboardData() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isPending, tokenReady, refreshCart } = useApi();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [loadingProductId, setLoadingProductId] = useState('');

  const displayProfile = {
    ...profile,
    name: profile.name || session?.user?.name || 'Maker',
    phone: profile.phone || session?.user?.phone || '',
  };

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) router.replace(loginPath(pathname || '/dashboard'));
  }, [isPending, session, router, pathname]);

  useEffect(() => {
    if (!tokenReady) return;

    async function loadDashboardData() {
      setIsLoading(true);
      setLoadError('');

      try {
        const [profileData, ordersData, customData, cartData] = await Promise.all([
          apiFetch('/profile'),
          apiFetch('/orders'),
          apiFetch('/orders/custom'),
          apiFetch('/cart'),
        ]);

        if (!hasPhoneNumber(session, profileData)) {
          router.replace(
            `/complete-profile?next=${encodeURIComponent(pathname || '/dashboard')}`
          );
          return;
        }

        setProfile({
          imageUrl: profileData.imageUrl || '',
          name: profileData.name || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
        });
        setOrders(mergeOrders(ordersData, customData));
        setCartItems((cartData.items || []).map(mapCartItemFromApi));
        await refreshCart();
      } catch (err) {
        setLoadError(err.message || 'Failed to load dashboard. Is the backend running?');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [tokenReady, refreshCart, session, router, pathname]);

  const handleQuantityChange = useCallback(
    async (item, nextQuantity) => {
      setCartItems((prev) =>
        prev.map((cartItem) => {
          if (item.itemType === 'custom') {
            return cartItem.customItemId === item.customItemId
              ? { ...cartItem, quantity: nextQuantity }
              : cartItem;
          }
          return matchesCartItem(cartItem, item.productId, item.customText, item.color?.hex)
            ? { ...cartItem, quantity: nextQuantity }
            : cartItem;
        })
      );

      try {
        if (item.itemType === 'custom') {
          await apiFetch(`/cart/custom-items/${item.customItemId}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity: nextQuantity }),
          });
        } else if (item.productId) {
          const body = { quantity: nextQuantity };
          if (item.customText) body.customText = item.customText;
          if (item.color?.hex) body.colorHex = item.color.hex;

          await apiFetch(`/cart/items/${item.productId}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
          });
        }
        await refreshCart();
      } catch (err) {
        console.error('Failed to update cart quantity:', err);
      }
    },
    [refreshCart]
  );

  const handleRemoveCartItem = useCallback(
    async (item) => {
      setCartItems((prev) =>
        prev.filter((cartItem) => {
          if (item.itemType === 'custom') {
            return cartItem.customItemId !== item.customItemId;
          }
          return !matchesCartItem(
            cartItem,
            item.productId,
            item.customText,
            item.color?.hex
          );
        })
      );

      try {
        if (item.itemType === 'custom') {
          await apiFetch(`/cart/custom-items/${item.customItemId}`, { method: 'DELETE' });
        } else if (item.productId) {
          await apiFetch(
            `/cart/items/${item.productId}${buildCartItemQuery(item.customText, item.color?.hex)}`,
            { method: 'DELETE' }
          );
        }
        await refreshCart();
      } catch (err) {
        console.error('Failed to remove cart item:', err);
      }
    },
    [refreshCart]
  );

  const handleSaveProfile = useCallback(async (nextProfile) => {
    setProfile(nextProfile);

    try {
      const updated = await apiFetch('/profile', {
        method: 'PATCH',
        body: JSON.stringify(nextProfile),
      });
      setProfile({
        imageUrl: updated.imageUrl || '',
        name: updated.name || '',
        phone: updated.phone || '',
        address: updated.address || '',
      });
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  }, []);

  const handleCheckout = useCallback(async () => {
    if (!cartItems.length) return;

    if (!displayProfile.address || !displayProfile.phone) {
      showToast(
        'Please add your shipping address and phone before checkout.',
        'error'
      );
      return;
    }

    setIsCheckingOut(true);

    try {
      const order = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: {
            name: displayProfile.name,
            phone: displayProfile.phone,
            address: displayProfile.address,
          },
        }),
      });

      setCartItems([]);
      showToast(
        `Order ${order.orderNumber} placed. Payment on delivery — awaiting confirmation.`,
        'success'
      );
      const [ordersData, customData] = await Promise.all([
        apiFetch('/orders'),
        apiFetch('/orders/custom'),
      ]);
      setOrders(mergeOrders(ordersData, customData));
      await refreshCart();
    } catch (err) {
      showToast(err.message || 'Checkout failed', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  }, [cartItems, displayProfile, refreshCart, showToast]);

  const reloadCartItems = useCallback(async () => {
    try {
      const cartData = await apiFetch('/cart');
      setCartItems((cartData.items || []).map(mapCartItemFromApi));
      await refreshCart();
    } catch (err) {
      console.error('Failed to reload cart:', err);
    }
  }, [refreshCart]);

  const handleViewProduct = useCallback(
    async (productId) => {
      if (!productId) return;

      setLoadingProductId(productId);
      try {
        const product = await apiFetch(`/products/${productId}`);
        setViewingProduct(product);
      } catch (err) {
        showToast(err.message || 'Failed to load product', 'error');
      } finally {
        setLoadingProductId('');
      }
    },
    [showToast]
  );

  const closeProductModal = useCallback(() => {
    setViewingProduct(null);
  }, []);

  const handleAddToCartFromModal = useCallback(
    async (product, quantity = 1, customText = '', selectedColor = null) => {
      if (!session?.user) {
        showToast('Please log in to add items to your cart.', 'error');
        router.push(loginPath(pathname || '/dashboard'));
        return false;
      }

      if (!tokenReady) {
        showToast('Preparing your session. Try again in a moment.', 'error');
        return false;
      }

      try {
        const body = { productId: product.id, quantity };
        if (customText) {
          body.customText = customText;
        }
        if (selectedColor?.hex) {
          body.colorHex = selectedColor.hex;
          body.colorLabel = selectedColor.label;
        }

        await apiFetch('/cart/items', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        await reloadCartItems();
        showToast(`${product.name} added to cart.`, 'success');
        return true;
      } catch (err) {
        showToast(err.message || 'Failed to add to cart.', 'error');
        return false;
      }
    },
    [session, tokenReady, reloadCartItems, showToast, router, pathname]
  );

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      const { error } = await authClient.signOut();
      if (error) {
        setIsLoggingOut(false);
        return;
      }

      clearAccessToken();
      await refreshCart();
      router.push('/');
    } catch {
      setIsLoggingOut(false);
    }
  }, [refreshCart, router]);

  return {
    session,
    isPending,
    tokenReady,
    isLoading,
    loadError,
    setLoadError,
    displayProfile,
    userEmail: session?.user?.email || '',
    cartItems,
    orders,
    isCheckingOut,
    isLoggingOut,
    handleQuantityChange,
    handleRemoveCartItem,
    handleSaveProfile,
    handleCheckout,
    handleLogout,
    viewingProduct,
    loadingProductId,
    handleViewProduct,
    closeProductModal,
    handleAddToCartFromModal,
  };
}
