'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { RiFacebookLine } from "react-icons/ri";
import { PiYoutubeLogoLight } from "react-icons/pi";
import { useGsap, fadeUpOnScroll } from '@/lib/gsap';



const exploreLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Products', href: '/products' },
  { label: 'Gallery', href: '/products' },
  // { label: 'About', href: '/about' },
];

const protocolLinks = [
  { label: 'Terms of Service', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Shipping Info', href: '#' },
  { label: 'Contact Us', href: '/contact' },
];

export default function Footer() {
  const footerRef = useRef(null);

  useGsap(
    (gsap) => {
      gsap.from('.footer-col', {
        scrollTrigger: { trigger: footerRef.current, start: 'top 90%', once: true },
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      });

      fadeUpOnScroll(gsap, '.footer-bottom', { start: 'top 95%', y: 12, duration: 0.5 });
    },
    [],
    { scopeRef: footerRef }
  );

  return (
    <footer ref={footerRef} className="bg-[#001c08] border-t border-[#2A2A2A]">
      {/* Main Grid */}
      <div className="max-w-container-max mx-auto px-margin-page py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* COL 1 — Brand */}
          <div className="footer-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-4 h-4 bg-[#1DB954] rounded-[1px]"></span>
              <span className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                TOOLIFY 3D
              </span>
            </div>
            <p className="font-body text-sm text-[#9E9E9E] leading-relaxed mb-6 max-w-[260px]">
              Precision additive manufacturing for the next generation of makers. Engineered for reliability in industrial environments.
            </p>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs text-[#1DB954] tracking-wider">
                {'// ALL_SYSTEMS_OPERATIONAL'}
              </span>
              <span className="w-[6px] h-[11px] bg-[#1DB954] animate-pulse"></span>
            </div>
          </div>

          {/* COL 2 — Explore */}
          <div className="footer-col">
            <h4 className="font-mono text-xs text-[#1DB954] uppercase tracking-[0.2em] mb-5">
              Explore
            </h4>
            <ul className="flex flex-col gap-3">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-[#E5E5E5] uppercase font-medium hover:text-[#1DB954] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 3 — Protocol */}
          <div className="footer-col">
            <h4 className="font-mono text-xs text-[#1DB954] uppercase tracking-[0.2em] mb-5">
              Protocol
            </h4>
            <ul className="flex flex-col gap-3">
              {protocolLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-[#E5E5E5] uppercase font-medium hover:text-[#1DB954] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 4 — Communication */}
          <div className="footer-col">
            <h4 className="font-mono text-xs text-[#1DB954] uppercase tracking-[0.2em] mb-5">
              Communication
            </h4>

            {/* Email Subscribe */}
            <div className="flex mb-6">
              <input
                type="email"
                placeholder="ENTER EMAIL"
                className="flex-1 bg-transparent border border-[#2A2A2A] px-3 py-2 font-mono text-xs text-[#9E9E9E] placeholder-[#9E9E9E] outline-none focus:border-[#1DB954] transition-colors rounded-[2px] rounded-r-none"
              />
              <button className="bg-[#1DB954] text-[#0D0D0D] font-mono text-xs font-bold px-4 py-2 rounded-[2px] rounded-l-none hover:bg-[#15883C] transition-colors duration-200 uppercase tracking-wider">
                Subscribe
              </button>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {/* Asterisk / Flower icon */}
              <a href="#" className="w-9 h-9 border border-[#2A2A2A] rounded-[2px] flex items-center justify-center hover:border-[#1DB954] hover:text-[#1DB954] text-[#9E9E9E] transition-colors duration-200">
              <RiFacebookLine />
              </a>
              {/* Instagram */}
              <a href="#" className="w-9 h-9 border border-[#2A2A2A] rounded-[2px] flex items-center justify-center hover:border-[#1DB954] hover:text-[#1DB954] text-[#9E9E9E] transition-colors duration-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
                </svg>
              </a>
              {/* YouTube / Monitor */}
              <a href="#" className="w-9 h-9 border border-[#2A2A2A] rounded-[2px] flex items-center justify-center hover:border-[#1DB954] hover:text-[#1DB954] text-[#9E9E9E] transition-colors duration-200">
              <PiYoutubeLogoLight />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom border-t border-[#2A2A2A]">
        <div className="max-w-container-max mx-auto px-margin-page py-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="font-mono text-[11px] text-[#9E9E9E] uppercase tracking-wider">
            © 2026 TOOLIFY 3D // 3D_UNIT_01
          </p>
          <p className='text-xs text-[#9e9e9ece]'>Developed by <Link href="https://www.linkedin.com/in/himelahmed404" className="text-[#1db954bc] hover:text-[#15883C] transition-colors duration-200">Himel Ahmed</Link></p>
          <p className="font-mono text-[11px] text-[#9E9E9E] uppercase tracking-wider">
            DESIGNED_FOR_PRECISION{' '}
            <span className="text-white font-bold">[V2.4.0]</span>
          </p>
        </div>
      </div>
    </footer>
  );
}