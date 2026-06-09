/**
 * Inlines a Schema.org JSON-LD block in a server component. React serializes
 * the script tag with the JSON.stringify of the data, escaping `<` to avoid
 * any chance of breaking out of the script context.
 */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
