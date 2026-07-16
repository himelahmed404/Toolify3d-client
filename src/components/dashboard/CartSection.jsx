import Link from 'next/link';
import CartItemRow, { getCartItemKey } from './CartItemRow';
import { formatPrice } from '@/lib/dashboard/mappers';

const SHIPPING_FLAT = 5.0;

export default function CartSection({
  cartItems,
  isCheckingOut,
  onQuantityChange,
  onRemove,
  onCheckout,
  onViewProduct,
  loadingProductId,
}) {
  const currency = cartItems[0]?.currency || '৳';
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cartItems.length ? SHIPPING_FLAT : 0;
  const total = subtotal + shipping;

  return (
    <section className="dashboard-reveal lg:col-span-7 flex flex-col gap-6">
      <div className="flex items-baseline gap-2 justify-between">
        <span className="text-primary-container font-mono text-sm tracking-wide">
          {'// ACTIVE_CART'}
        </span>
        <span className="font-mono text-sm text-on-surface-variant uppercase">
          Items: {String(itemCount).padStart(2, '0')}
        </span>
      </div>
      <div className="bg-surface-container-lowest technical-border p-6 flex flex-col gap-4 rounded-sm">
        {!cartItems.length ? (
          <div className="py-8 text-center">
            <p className="font-body text-on-surface-variant mb-4">Your cart is empty.</p>
            <Link
              href="/products"
              className="font-mono text-sm text-primary hover:text-primary-container transition-colors uppercase inline-flex items-center gap-1"
            >
              Browse Products
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <CartItemRow
                  key={getCartItemKey(item)}
                  item={item}
                  onQuantityChange={onQuantityChange}
                  onRemove={onRemove}
                  onViewProduct={onViewProduct}
                  loadingProductId={loadingProductId}
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
              <Link
                href="/products"
                className="font-mono text-sm text-primary hover:text-primary-container transition-colors uppercase inline-flex items-center gap-1"
              >
                View More Products
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="mt-2 border-t border-outline-variant pt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm text-on-surface-variant uppercase">Subtotal</span>
                <span className="font-mono text-base">{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm text-on-surface-variant uppercase">
                  Est. Shipping
                </span>
                <span className="font-mono text-base">{formatPrice(shipping, currency)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-outline-variant border-dashed">
                <span className="font-mono text-sm font-bold uppercase">Total</span>
                <span className="font-mono text-xl font-bold text-primary">
                  {formatPrice(total, currency)}
                </span>
              </div>
              <button
                type="button"
                onClick={onCheckout}
                disabled={isCheckingOut || !cartItems.length}
                className="btn-primary w-full py-3 mt-4 font-mono text-sm flex items-center justify-center gap-2 uppercase disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
                {isCheckingOut ? 'Placing Order...' : 'Proceed to Checkout (COD)'}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
