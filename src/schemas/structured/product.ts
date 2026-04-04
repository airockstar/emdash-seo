export function buildProductSchema(data: {
  name: string;
  description?: string;
  image?: string;
  price?: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  brand?: string;
  ratingValue?: number;
  reviewCount?: number;
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@type": "Product",
    name: data.name,
  };
  if (data.description) schema.description = data.description;
  if (data.image) schema.image = data.image;
  if (data.brand) schema.brand = { "@type": "Brand", name: data.brand };

  if (data.price !== undefined && data.currency) {
    schema.offers = {
      "@type": "Offer",
      price: data.price,
      priceCurrency: data.currency,
      availability: data.availability ? `https://schema.org/${data.availability}` : undefined,
    };
  }

  if (data.ratingValue !== undefined && data.reviewCount !== undefined) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: data.ratingValue,
      reviewCount: data.reviewCount,
    };
  }

  return schema;
}
