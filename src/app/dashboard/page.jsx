'use client';

import { useEffect, useRef, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import { useGsap, loadGsap } from '@/lib/gsap';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProfileCard from '@/components/dashboard/ProfileCard';
import ProfileEditModal from '@/components/dashboard/ProfileEditModal';
import CartSection from '@/components/dashboard/CartSection';
import OrderHistorySection from '@/components/dashboard/OrderHistorySection';
import LogoutConfirmModal from '@/components/dashboard/LogoutConfirmModal';
import ProductModal from '@/components/products/ProductModal';

export default function DashboardPage() {
  const pageRef = useRef(null);
  const [orderFilter, setOrderFilter] = useState('All');
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const {
    session,
    isPending,
    tokenReady,
    isLoading,
    loadError,
    setLoadError,
    displayProfile,
    userEmail,
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
  } = useDashboardData();

  useEffect(() => {
    loadGsap();
  }, []);

  const isContentLoading =
    isPending || (session?.user && !tokenReady) || (session?.user && isLoading);
  const contentReady = Boolean(session?.user && !isContentLoading);

  useGsap(
    (gsap) => {
      if (!contentReady || !pageRef.current) return;
      const targets = pageRef.current.querySelectorAll('.dashboard-reveal');
      if (!targets.length) return;

      gsap.from(targets, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 0.1,
      });
    },
    [contentReady],
    { scopeRef: pageRef, scrollTrigger: false }
  );

  if (isContentLoading) {
    return (
      <PageShell mainClassName="bg-background text-on-background min-h-screen">
        <div className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full py-24 text-center">
          <p className="font-mono text-sm text-primary-container uppercase">{'// LOADING_DASHBOARD'}</p>
          <p className="font-body text-on-surface-variant mt-2">Loading your dashboard...</p>
        </div>
      </PageShell>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <PageShell mainClassName="bg-background text-on-background">
      <div
        ref={pageRef}
        className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full flex flex-col gap-section-padding-v pb-16"
      >
        {loadError && (
          <div className="font-mono text-sm text-red-600 border border-red-200 bg-red-50 px-4 py-3 rounded-sm flex items-start justify-between gap-4">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => setLoadError('')}
              className="shrink-0 text-red-600 hover:text-red-800"
              aria-label="Dismiss error"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        <DashboardHeader onLogout={() => setLogoutOpen(true)} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <ProfileCard
            profile={displayProfile}
            email={userEmail}
            userId={session?.user?.id}
            onEdit={() => setProfileOpen(true)}
          />

          <CartSection
            cartItems={cartItems}
            isCheckingOut={isCheckingOut}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveCartItem}
            onCheckout={handleCheckout}
            onViewProduct={handleViewProduct}
            loadingProductId={loadingProductId}
          />
        </div>

        <OrderHistorySection orders={orders} filter={orderFilter} onFilterChange={setOrderFilter} />
      </div>

      <ProfileEditModal
        open={profileOpen}
        profile={displayProfile}
        onClose={() => setProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      <LogoutConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {viewingProduct ? (
        <ProductModal
          product={viewingProduct}
          onClose={closeProductModal}
          onAddToCart={handleAddToCartFromModal}
        />
      ) : null}
    </PageShell>
  );
}
