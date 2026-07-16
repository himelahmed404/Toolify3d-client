import JsonLd from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/schema';

export const metadata = pageMetadata({
  title: 'Products',
  description:
    'Browse ready-to-order 3D prints — hobby, functional, cosplay, and miniatures. Filter by category and material, or request a fully custom print.',
  path: '/products',
});

export default function ProductsLayout({ children }) {
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([{ name: 'Products', path: '/products' }])}
      />
      {children}
    </>
  );
}
