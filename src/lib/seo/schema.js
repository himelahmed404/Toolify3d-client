import { SITE, absoluteUrl } from '@/lib/seo/site';
import { QUOTE_MATERIALS } from '@/lib/quote/materials';

const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

// Site-wide Organization. Referenced by other schema via @id.
export function organizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: absoluteUrl(SITE.logo),
    image: absoluteUrl(SITE.ogImage),
    description: SITE.description,
    slogan: SITE.tagline,
    foundingDate: SITE.foundingDate,
    founders: SITE.founders.map((name) => ({ '@type': 'Person', name })),
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    areaServed: { '@type': 'Country', name: SITE.areaServed },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: SITE.languages,
        areaServed: 'BD',
      },
    ],
  };

  if (SITE.sameAs?.length) {
    schema.sameAs = SITE.sameAs;
  }

  return schema;
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
  };
}

// items: [{ name, path }] ordered root -> current. Home is prepended automatically.
export function breadcrumbSchema(items = []) {
  const all = [{ name: 'Home', path: '/' }, ...items];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Custom 3D Printing & Modeling',
    serviceType: '3D Printing',
    url: absoluteUrl('/services'),
    description:
      'Industrial-grade custom 3D printing in PLA+, PETG, and TPU, plus 3D design and modeling services. 1-4 day turnaround with nationwide delivery across Bangladesh.',
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: SITE.areaServed },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: '3D Printing Services',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Custom 3D Printing',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Custom 3D Printing',
                description:
                  'Send your STL, OBJ, 3MF, or STEP file and we print it in high precision (0.08mm layers).',
              },
            },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: '3D Design & Modeling',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: '3D Design & Modeling',
                description:
                  'No file? Our engineers turn sketches, photos, or physical objects into print-ready CAD models.',
              },
            },
          ],
        },
      ],
    },
  };
}

// Product + Offer schema for the per-gram material pricing.
// Uses static baseline rates so the schema never depends on a live API call.
export function materialProductsSchema() {
  const descriptions = {
    PLA: 'Rigid, highly detailed filament with a wide color range. Ideal for miniatures, props, and display pieces.',
    PETG: 'Heat-resistant, impact-tough filament for functional and outdoor parts.',
    TPU: 'Flexible, rubber-like filament for gaskets, phone cases, and wearables.',
  };

  return QUOTE_MATERIALS.map((material) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${material.name} 3D Printing`,
    description: descriptions[material.id] || `${material.name} 3D printing material.`,
    category: '3D Printing Material',
    brand: { '@type': 'Brand', name: SITE.name },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl('/pricing'),
      priceCurrency: 'BDT',
      price: String(material.costPerGram),
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: String(material.costPerGram),
        priceCurrency: 'BDT',
        unitCode: 'GRM',
        unitText: 'per gram',
      },
      availability: 'https://schema.org/InStock',
      seller: { '@id': ORG_ID },
    },
  }));
}

export function faqSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function contactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Toolify 3D',
    url: absoluteUrl('/contact'),
    description:
      'Get a custom 3D printing quote. Send your file or message us on WhatsApp. Response within 2 hours.',
    about: { '@id': ORG_ID },
  };
}

export function aboutPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Toolify 3D',
    url: absoluteUrl('/about'),
    description:
      'The story and mission behind Toolify 3D — empowering Bangladeshi makers to compile their ideas into reality.',
    about: { '@id': ORG_ID },
  };
}
