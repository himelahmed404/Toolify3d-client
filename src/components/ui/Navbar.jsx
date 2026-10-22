'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useGsap } from '@/lib/gsap';
import { useApi } from '@/components/providers/ApiProvider';
import { loginPath } from '@/lib/auth-redirect';
import { LuCircleUser } from 'react-icons/lu';

const NAV_HEIGHT = 64;
// px under the nav before white bg kicks in. Raise = stay transparent longer.
// Lower / bigger negative feel = flip to white sooner.
const HERO_SOLIDIFY_OFFSET = {
  mobile: NAV_HEIGHT + 120, // tweak mobile here (e.g. 80 sooner, 200 later)
  desktop: NAV_HEIGHT, // tweak desktop here
};
const MOBILE_MQ = '(max-width: 767px)';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/products', label: 'Shop' },
  // { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

function UserAvatar({ name, image, size = 32 }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={size}
        height={size}
        className="rounded-sm object-cover border border-border shrink-0"
      />
    );
  }

  return (
    <span
      className="rounded-sm border border-border bg-alt-bg shrink-0 flex items-center justify-center text-muted"
      style={{ width: size, height: size }}
    >
      {initials ? (
        <span className="font-mono text-[10px] font-bold">{initials}</span>
      ) : (
        <LuCircleUser className="w-4 h-4" />
      )}
    </span>
  );
}

function UserNavChip({ name, image, className = '', textClassName = 'text-dark' }) {
  const firstName = name.split(' ')[0];

  return (
    <Link
      href="/dashboard"
      className={`flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity duration-200 ${className}`}
      aria-label="Go to dashboard"
    >
      <UserAvatar name={name} image={image} />
      <span className={`font-body text-sm font-medium truncate ${textClassName}`}>
        Hi, {firstName}
      </span>
    </Link>
  );
}

function CartIcon({ count = 0 }) {
  return (
    <>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const navRef = useRef(null);
  const isHome = pathname === '/';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Gate auth UI until after mount so SSR HTML matches the first client render.
  // better-auth useSession is pending on the server but can resolve from cache on the client.
  const [authReady, setAuthReady] = useState(false);
  // Transparent while homepage hero is still under the nav
  const [isOverHero, setIsOverHero] = useState(isHome);
  const isTransparent = isHome && isOverHero;

  const { session, isPending, cartCount } = useApi();
  const name = session?.user?.name || 'User';
  const userImage = session?.user?.image || null;
  // Treat as pending until mounted so hydration always sees the placeholder branch
  const authPending = !authReady || isPending;

  useEffect(() => {
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!isHome) {
      setIsOverHero(false);
      return undefined;
    }

    setIsOverHero(true);
    let observer;
    let frame;
    const mq = window.matchMedia(MOBILE_MQ);

    const getOffset = () =>
      mq.matches ? HERO_SOLIDIFY_OFFSET.mobile : HERO_SOLIDIFY_OFFSET.desktop;

    const attach = () => {
      const target = document.getElementById('home-hero');
      if (!target) return false;

      observer?.disconnect();
      // Larger offset = hero "leaves" the watched area sooner → white bg earlier
      const offset = getOffset();
      observer = new IntersectionObserver(
        ([entry]) => {
          setIsOverHero(entry.isIntersecting);
        },
        { threshold: 0, rootMargin: `-${offset}px 0px 0px 0px` }
      );
      observer.observe(target);
      return true;
    };

    if (!attach()) {
      frame = requestAnimationFrame(attach);
    }

    const onBreakpointChange = () => attach();
    mq.addEventListener('change', onBreakpointChange);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      mq.removeEventListener('change', onBreakpointChange);
      observer?.disconnect();
    };
  }, [isHome]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useGsap(
    (gsap) => {
      gsap.from(navRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });

      gsap.from('.nav-link', {
        y: -8,
        opacity: 0,
        duration: 0.4,
        stagger: 0.06,
        delay: 0.3,
        ease: 'power2.out',
      });

      gsap.from('.nav-actions', {
        opacity: 0,
        duration: 0.4,
        delay: 0.5,
        ease: 'power2.out',
      });
    },
    [],
    { scopeRef: navRef, scrollTrigger: false }
  );

  const headerPosition = isHome ? 'fixed top-0 inset-x-0' : 'sticky top-0';
  const headerSurface = isTransparent
    ? 'bg-transparent border-transparent'
    : 'bg-white border-border';
  const logoText = isTransparent ? 'text-white' : 'text-dark';
  const linkIdle = isTransparent
    ? 'text-white/70 hover:text-white'
    : 'text-muted hover:text-dark';
  const chipText = isTransparent ? 'text-white' : 'text-dark';
  const iconColor = isTransparent
    ? 'text-white/80 hover:text-brand'
    : 'text-gray-600 hover:text-brand';
  const iconMuted = isTransparent
    ? 'text-white/80 hover:text-brand'
    : 'text-muted hover:text-brand';
  const divider = isTransparent ? 'bg-white/20' : 'bg-border';
  const hamburger = isTransparent ? 'bg-white' : 'bg-dark';
  const loginBtn = isTransparent
    ? 'text-dark bg-white border-white hover:bg-transparent hover:text-white'
    : 'text-white bg-dark border-border hover:border-black hover:bg-white hover:text-dark';

  return (
    <header
      ref={navRef}
      className={`${headerPosition} z-50 border-b transition-colors duration-300 ${headerSurface}`}
    >
      <div className="max-w-container-max mx-auto px-margin-page h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            className={`font-display font-extrabold text-lg uppercase tracking-tight transition-colors duration-300 ${logoText}`}
          >
            <Image src="/media/gal/logo.png" alt="Toolify 3D" width={80} height={80} priority
              style={{ width: 'auto', height: 'auto' }} />
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-7 relative">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link relative font-body text-sm pb-[22px] -mb-[22px] transition-colors duration-200 ${isActive ? 'text-brand font-semibold' : linkIdle
                  }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-brand rounded-full"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="nav-actions flex items-center gap-3">
          {authPending ? (
            <div className="hidden md:block w-24 h-9" aria-hidden="true" />
          ) : session ? (
            <>
              <UserNavChip
                name={name}
                image={userImage}
                className="hidden md:flex max-w-[160px]"
                textClassName={`${chipText} transition-colors duration-300`}
              />
              <Link
                href="/dashboard"
                className="md:hidden flex items-center"
                aria-label="Go to dashboard"
              >
                <UserAvatar name={name} image={userImage} size={28} />
              </Link>
              <div className={`hidden md:block w-px h-6 mx-1 transition-colors duration-300 ${divider}`} />
              <Link
                href="/dashboard"
                className={`relative w-9 h-9 flex items-center justify-center transition-colors duration-200 ${iconColor}`}
                aria-label="Shopping cart"
              >
                <CartIcon count={cartCount} />
              </Link>
            </>
          ) : (
            <>
              <Link
                href={loginPath(pathname)}
                className={`hidden md:inline-flex font-body text-sm font-medium border px-5 py-2 rounded-sm transition-all duration-200 ${loginBtn}`}
              >
                Login
              </Link>
              <div className={`hidden md:block w-px h-6 mx-1 transition-colors duration-300 ${divider}`} />
              <button
                type="button"
                className={`relative w-9 h-9 flex items-center justify-center transition-colors duration-200 ${iconMuted}`}
                aria-label="Shopping Cart"
              >
                <CartIcon count={cartCount} />
              </button>
            </>
          )}

          {/* Mobile Hamburger Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8 ml-1 z-50"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-[2px] transition-all duration-300 ${hamburger} ${isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
                }`}
            ></span>
            <span
              className={`block w-6 h-[2px] transition-all duration-300 ${hamburger} ${isMobileMenuOpen ? 'opacity-0' : ''
                }`}
            ></span>
            <span
              className={`block w-6 h-[2px] transition-all duration-300 ${hamburger} ${isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
                }`}
            ></span>
          </button>
        </div>
      </div>

      {/* Mobile menu — transparent over hero to match desktop vibe */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden absolute top-16 left-0 w-full py-4 px-6 flex flex-col gap-4 z-40 border-b transition-colors duration-300 ${isTransparent
              ? 'bg-transparent backdrop-blur-xs backdrop-brightness-75 border-transparent'
              : 'bg-white border-border shadow-lg'
            }`}
        >
          {session && (
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-sm font-medium pb-2 border-b flex items-center gap-2 ${isTransparent
                  ? 'text-white border-white/15'
                  : 'text-dark border-border'
                }`}
            >
              <UserAvatar name={name} image={userImage} size={28} />
              Hi, {name.split(' ')[0]}
            </Link>
          )}

          <nav className="flex flex-wrap gap-3.5 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-body text-sm px-4 border rounded-sm py-1.5 transition-colors duration-200 ${pathname === link.href
                    ? 'text-brand font-semibold border-brand/40'
                    : isTransparent
                      ? 'text-white/80 border-white/20 hover:bg-white/10 hover:text-white'
                      : 'text-muted border-border hover:bg-alt-bg'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {!session && (
            <div
              className={`flex flex-col gap-3 pt-4 border-t ${isTransparent ? 'border-white/15' : 'border-border'
                }`}
            >
              <Link
                href={loginPath(pathname)}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-center font-body text-sm font-medium border px-5 py-2 rounded-sm ${isTransparent
                    ? 'text-white border-white/30 hover:bg-white/10'
                    : 'text-dark border-border'
                  }`}
              >
                Login
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center font-body text-sm font-semibold text-white bg-brand px-5 py-2 rounded-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
