import JsonLd from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { aboutPageSchema, breadcrumbSchema } from '@/lib/seo/schema';

export const metadata = pageMetadata({
  title: 'About',
  description:
    'Toolify 3D was founded in Dhaka to help Bangladeshi makers turn ideas into reality. Meet the team, our story, and the printers behind every project.',
  path: '/about',
});

export default function AboutLayout({ children }) {
  return (
    <>
      <JsonLd
        schema={[
          aboutPageSchema(),
          breadcrumbSchema([{ name: 'About', path: '/about' }]),
        ]}
      />
      {children}
    </>
  );
}
