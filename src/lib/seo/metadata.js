import { SITE, absoluteUrl } from '@/lib/seo/site';

// Builds a Next.js Metadata object for a page with sensible OG/Twitter/canonical defaults.
// Pass a relative `path` (e.g. '/services') for the canonical + OG url.
export function pageMetadata({
  title,
  description = SITE.description,
  path = '/',
  image = SITE.ogImage,
  keywords,
  noindex = false,
  ogType = 'website',
} = {}) {
  const url = absoluteUrl(path);
  const ogTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;

  return {
    title,
    description,
    keywords: keywords ?? SITE.keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: ogType,
      siteName: SITE.name,
      title: ogTitle,
      description,
      url,
      locale: SITE.locale,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [image],
    },
    ...(noindex
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}
