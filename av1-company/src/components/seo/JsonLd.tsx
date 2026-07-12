interface JsonLdProps {
  data: Record<string, unknown>
}

/** Renders a JSON-LD <script> tag. Placement in the DOM doesn't matter for
 *  crawlers — it just needs to be present in the rendered HTML. */
export function JsonLd({ data }: JsonLdProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
