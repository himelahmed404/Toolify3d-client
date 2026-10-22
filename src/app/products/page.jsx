'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import ProductCard from '@/components/products/ProductCard';
import ProductModal from '@/components/products/ProductModal';
import WhatsAppLink from '@/components/ui/WhatsAppLink';
import {
  useGsap,
  loadGsap,
  prefersReducedMotion,
  fadeUpOnScroll,
  fadeFromHidden,
} from '@/lib/gsap';
import { apiFetch } from '@/lib/api/client';
import { useApi } from '@/components/providers/ApiProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { loginPath } from '@/lib/auth-redirect';

const CATEGORIES = ['ALL', 'KEYCHAIN', 'LAMP', 'DESK ESSENTIAL', 'HOT WHEELS', 'ANIME FIGURES'];
const MATERIAL_FILTERS = ['PLA+', 'PETG', 'TPU'];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Sort: Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const pageRef = useRef(null);
  const gridRef = useRef(null);
  const currentPageRef = useRef(1);
  const scrollAfterPageChangeRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const { tokenReady, session, refreshCart } = useApi();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [materials, setMaterials] = useState([]);
  const [sort, setSort] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  currentPageRef.current = currentPage;

  useEffect(() => {
    async function loadProducts() {
      setProductsLoading(true);

      try {
        const params = new URLSearchParams();
        if (category !== 'ALL') params.set('category', category);
        if (materials.length === 1) params.set('material', materials[0]);
        if (sort !== 'featured') params.set('sort', sort);

        const query = params.toString();
        const data = await apiFetch(`/products${query ? `?${query}` : ''}`);
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setProductsLoading(false);
      }
    }

    loadProducts();
  }, [category, materials, sort]);

  const filteredProducts = useMemo(() => {
    if (materials.length <= 1) return products;

    return products.filter(
      (p) => materials.length === 0 || materials.includes(p.material)
    );
  }, [products, materials]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, materials, sort]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!scrollAfterPageChangeRef.current) return;
    scrollAfterPageChangeRef.current = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleAddToCart = useCallback(
    async (product, quantity = 1, customText = '', selectedColor = null) => {
      if (!session?.user) {
        showToast('Please log in to add items to your cart.', 'error');
        router.push(loginPath(pathname || '/products'));
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
        await refreshCart();
        showToast(`${product.name} added to cart.`, 'success');
        return true;
      } catch (err) {
        showToast(err.message || 'Failed to add to cart.', 'error');
        return false;
      }
    },
    [session, tokenReady, refreshCart, showToast, router, pathname]
  );

  const toggleMaterial = (mat) => {
    setMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const openModal = useCallback((product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const goToPage = useCallback((page) => {
    const nextPage = typeof page === 'function' ? page(currentPageRef.current) : page;
    if (nextPage === currentPageRef.current) return;
    scrollAfterPageChangeRef.current = true;
    setCurrentPage(nextPage);
  }, []);

  useGsap((gsap) => {
    gsap.from('.products-hero-label', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 });
    gsap.from('.products-hero-title', { x: -40, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 });
    gsap.from('.products-stat-box', { y: 24, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.4)', delay: 0.35 });
    gsap.from('.products-sidebar', { x: -30, opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.3 });
    gsap.from('.products-toolbar', { y: 16, opacity: 0, duration: 0.5, ease: 'power2.out', delay: 0.4 });
    gsap.to('.product-card', { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out', delay: 0.5 });
    fadeUpOnScroll(gsap, '.products-cta', { y: 40, duration: 0.7 });
  }, [], { scopeRef: pageRef });

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const run = async () => {
      const { gsap } = await loadGsap();
      const cards = gridRef.current?.querySelectorAll('.product-card');
      if (!cards?.length) return;
      fadeFromHidden(gsap, cards);
    };
    run();
  }, [paginatedProducts, viewMode]);

  const handleViewToggle = (mode) => {
    setViewMode(mode);
  };

  return (
    <PageShell>
      <div ref={pageRef} className="bg-white text-on-background">
        {/* Page Header */}
        <header className="bg-surface-container-lowest border-b border-outline-variant py-10 w-full relative">
          <div className="px-margin-page mx-auto max-w-container-max flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="products-hero-label font-mono text-sm text-primary-container block mb-2">
                {'// PRODUCTS'}
              </span>
              <h1 className="products-hero-title font-display font-extrabold text-[48px] md:text-[64px] uppercase m-0 leading-none text-on-background">
                PRINTS.
              </h1>
            </div>
            
            {/* Top Stat Boxes Container */}
            <div className="flex flex-wrap gap-4">
              {/* Dynamic Showing Count */}
              <div className="products-stat-box border border-outline-variant px-4 py-2 bg-surface min-w-[140px] flex items-center justify-center gap-2">
                <span className="font-mono text-sm block text-secondary uppercase">
                  {`Showing ${filteredProducts.length} Print${filteredProducts.length !== 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="products-page-wrapper px-margin-page mx-auto max-w-container-max">
          {/* Sidebar */}
          <aside className="products-sidebar products-sidebar-dark pt-6 hidden md:block ">
            
            {/* Updated Full-Width Toolbar */}
            <div className="products-toolbar flex flex-col gap-3 mb-8 pb-6 mr-3 border-b border-outline-variant">
              <div className="flex w-full border border-outline-variant rounded-sm overflow-hidden bg-surface">
                <button
                  type="button"
                  aria-label="Grid View"
                  onClick={() => handleViewToggle('grid')}
                  className={`flex-1 py-2 flex items-center justify-center transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-surface-variant text-on-background'
                      : 'text-secondary hover:bg-surface-variant'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    grid_view
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="List View"
                  onClick={() => handleViewToggle('list')}
                  className={`flex-1 py-2 flex items-center justify-center transition-colors border-l border-outline-variant ${
                    viewMode === 'list'
                      ? 'bg-surface-variant text-on-background'
                      : 'text-secondary hover:bg-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">view_list</span>
                </button>
              </div>

              <div className="relative w-full">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full appearance-none bg-surface border border-outline-variant text-on-background font-body text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary px-3 py-2 pr-8 cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-mono text-sm text-primary-container mb-4 uppercase">
                {'// CATEGORY'}
              </h3>
              <ul className="space-y-3 font-body text-base text-secondary">
                {CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={category === cat}
                        onChange={() => setCategory(cat)}
                        className="text-primary-container focus:ring-primary-container bg-transparent border-[#474646]"
                      />
                      <span className="ml-3 group-hover:text-brand-dark transition-colors">{cat}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-sm text-primary-container mb-4 uppercase">
                {'// MATERIAL'}
              </h3>
              <ul className="space-y-3 font-body text-base text-secondary">
                {MATERIAL_FILTERS.map((mat) => (
                  <li key={mat}>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={materials.includes(mat)}
                        onChange={() => toggleMaterial(mat)}
                        className="text-primary-container focus:ring-primary-container bg-transparent border-[#474646] rounded-none"
                      />
                      <span className="ml-3 group-hover:text-brand-dark transition-colors">{mat}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
                
          {/* Main Content */}
          <main className="products-main-content py-6 md:pl-8">
            {/* Product Grid */}
            <div
              ref={gridRef}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {productsLoading ? (
                <p className="font-body text-on-surface-variant col-span-full py-12 text-center">
                  Loading products...
                </p>
              ) : (
              paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  onOpen={openModal}
                />
              ))
              )}
            </div>

            {!productsLoading && filteredProducts.length > PAGE_SIZE && (
              <nav
                className="mt-10 pt-6 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4"
                aria-label="Product pagination"
              >
                <span className="font-mono text-xs uppercase text-secondary tracking-widest">
                  {`Page ${currentPage} of ${totalPages}`}
                  <span className="text-on-surface-variant ml-2 normal-case tracking-normal">
                    ({filteredProducts.length} prints)
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-outline-variant bg-surface font-mono text-xs uppercase tracking-widest text-on-background transition-colors hover:bg-surface-variant disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      aria-current={page === currentPage ? 'page' : undefined}
                      className={`min-w-9 px-2 py-2 border font-mono text-xs uppercase transition-colors ${
                        page === currentPage
                          ? 'border-primary-container bg-primary-container text-on-background'
                          : 'border-outline-variant bg-surface text-secondary hover:bg-surface-variant hover:text-on-background'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => goToPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-outline-variant bg-surface font-mono text-xs uppercase tracking-widest text-on-background transition-colors hover:bg-surface-variant disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </nav>
            )}

            {!productsLoading && filteredProducts.length === 0 && (
              <div className="py-16 text-center">
                <p className="font-mono text-sm text-secondary mb-2">{'// NO_RESULTS'}</p>
                <p className="font-body text-base text-on-surface-variant">
                  No prints match your filters. Try adjusting category or material.
                </p>
              </div>
            )}
          </main>
        </div>

        {/* Custom Order CTA */}
        <section className="products-cta bg-white border-t border-outline-variant py-section-padding-v mt-12">
          <div className="px-margin-page mx-auto max-w-container-max flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <span className="font-mono text-sm text-primary-container block mb-2">
                {'// CUSTOM_ORDER'}
              </span>
              <h2 className="font-display font-bold text-[32px] text-on-background mb-2">
                Don&apos;t See What You Need?
              </h2>
              <p className="font-body text-base text-secondary">
                We offer custom 3D printing services. Upload your STL file or contact us to discuss
                your specific requirements.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="btn-primary flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                Upload Your File
              </Link>
              <WhatsAppLink
                className="bg-surface border border-outline-variant text-on-background font-mono text-sm py-3 px-6 rounded-none transition-colors duration-200 hover:bg-surface-variant flex items-center justify-center gap-2 uppercase"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                Chat on WhatsApp
              </WhatsAppLink>
            </div>
          </div>
        </section>
      </div>

      {modalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={closeModal}
          onAddToCart={handleAddToCart}
        />
      )}
    </PageShell>
  );
}