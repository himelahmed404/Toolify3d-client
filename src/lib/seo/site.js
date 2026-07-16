// Central SEO configuration. Keep metadata + JSON-LD schema consistent from here.

// Production URL. Override per-environment with NEXT_PUBLIC_SITE_URL if needed.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://toolify3d.com'
).replace(/\/$/, '');

export const SITE = {
  name: 'Toolify 3D',
  legalName: 'Toolify 3D',
  tagline: 'Your Imagination Printed',
  url: SITE_URL,
  description:
    "High-precision 3D printing and modeling for engineers, artists, and creators. Send your STL file, get an instant per-gram quote, and receive your print in 1-4 days. Bangladesh's premier 3D printing service, shipping to all 64 districts.",
  // Static Open Graph / Twitter share image. Drop a 1200x630 file at this path.
  ogImage: '/media/gal/serviceHero2.JPG',
  logo: '/media/gal/logo.png',
  locale: 'en_US',
  foundingDate: '2026',
  founders: ['Shahabor Hossain Rifat'],
  address: {
    locality: 'Dhaka',
    region: 'Dhaka',
    country: 'BD',
  },
  areaServed: 'Bangladesh',
  languages: ['English', 'Bengali'],
  // Fill these in as they become available; empty entries are omitted from schema.
  sameAs: [],
  keywords: [
    '3D printing Bangladesh',
    '3D printing service Dhaka',
    'custom 3D printing',
    'STL printing',
    'PLA PETG TPU printing',
    'rapid prototyping Bangladesh',
    '3D modeling service',
    'online 3D printing quote',
  ],
};

// Absolute URL builder for a given path.
export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
