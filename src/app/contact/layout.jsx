import JsonLd from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { faqSchema, contactPageSchema, breadcrumbSchema } from '@/lib/seo/schema';
import { FAQ_ITEMS } from '@/data/faq';

export const metadata = pageMetadata({
  title: 'Contact',
  description:
    'Start your 3D print. Send your file or message us on WhatsApp for a custom quote — response within 2 hours. Serving Dhaka and all of Bangladesh.',
  path: '/contact',
});

export default function ContactLayout({ children }) {
  return (
    <>
      <JsonLd
        schema={[
          contactPageSchema(),
          faqSchema(FAQ_ITEMS),
          breadcrumbSchema([{ name: 'Contact', path: '/contact' }]),
        ]}
      />
      {children}
    </>
  );
}
