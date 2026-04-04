export function buildSoftwareSchema(data: {
  name: string;
  description?: string;
  operatingSystem?: string;
  applicationCategory?: string;
  price?: number;
  currency?: string;
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    name: data.name,
  };
  if (data.description) schema.description = data.description;
  if (data.operatingSystem) schema.operatingSystem = data.operatingSystem;
  if (data.applicationCategory) schema.applicationCategory = data.applicationCategory;
  if (data.price !== undefined && data.currency) {
    schema.offers = {
      "@type": "Offer",
      price: data.price,
      priceCurrency: data.currency,
    };
  }
  return schema;
}
