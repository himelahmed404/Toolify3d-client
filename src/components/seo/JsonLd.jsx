// Renders one or more JSON-LD schema objects as a <script> tag.
// Server component — the markup is included in the initial HTML for crawlers.
export default function JsonLd({ schema }) {
  if (!schema) return null;
  const data = Array.isArray(schema) ? schema : [schema];

  return (
    <>
      {data.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
