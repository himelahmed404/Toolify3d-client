import { SITE } from '@/lib/seo/site';

export default function manifest() {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0D0D0D',
    theme_color: '#1DB954',
    lang: 'en',
    icons: [
      {
        src: SITE.logo,
        sizes: 'any',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
