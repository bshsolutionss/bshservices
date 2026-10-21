import { safeJsonLd } from "@/lib/json-ld";

/** Server-rendered `<script type="application/ld+json">` for structured data. */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
