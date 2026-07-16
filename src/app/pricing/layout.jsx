import JsonLd from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { materialProductsSchema, breadcrumbSchema } from '@/lib/seo/schema';

export const metadata = pageMetadata({
  title: 'Pricing',
  description:
    'Transparent per-gram 3D printing prices. PLA+, PETG, and TPU with instant quotes — no hidden fees. Upload your STL and get an estimate in seconds.',
  path: '/pricing',
});

export default function PricingLayout({ children }) {
  return (
    <>
      <JsonLd
        schema={[
          ...materialProductsSchema(),
          breadcrumbSchema([{ name: 'Pricing', path: '/pricing' }]),
        ]}
      />
      {children}
    </>
  );
}
