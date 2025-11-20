/**
 * JsonLd Component
 * Injects Schema.org JSON-LD structured data into the page
 */

interface JsonLdProps {
  data: object | object[];
}

export function JsonLd({ data }: JsonLdProps) {
  // Handle both single objects and arrays of objects
  const jsonData = Array.isArray(data) ? data : data;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonData) }}
    />
  );
}
