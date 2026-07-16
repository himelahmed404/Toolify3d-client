import JsonLd from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { serviceSchema, breadcrumbSchema } from '@/lib/seo/schema';

export const metadata = pageMetadata({
  title: 'Services',
  description:
    'Custom 3D printing and 3D modeling services in PLA+, PETG, and TPU. High-precision prints with 1-4 day turnaround, delivered across all 64 districts of Bangladesh.',
  path: '/services',
});

export default function ServicesLayout({ children }) {
  return (
    <>
      <JsonLd
        schema={[
          serviceSchema(),
          breadcrumbSchema([{ name: 'Services', path: '/services' }]),
        ]}
      />
      {children}
    </>
  );
}
