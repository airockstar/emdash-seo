export function buildLocalBusinessSchema(data: {
  name: string;
  address?: { street?: string; city?: string; state?: string; zip?: string; country?: string };
  phone?: string;
  hours?: string[];
  geo?: { lat: number; lng: number };
  image?: string;
  url?: string;
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@type": "LocalBusiness",
    name: data.name,
  };
  if (data.url) schema.url = data.url;
  if (data.image) schema.image = data.image;
  if (data.phone) schema.telephone = data.phone;

  if (data.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: data.address.street,
      addressLocality: data.address.city,
      addressRegion: data.address.state,
      postalCode: data.address.zip,
      addressCountry: data.address.country,
    };
  }

  if (data.geo) {
    schema.geo = { "@type": "GeoCoordinates", latitude: data.geo.lat, longitude: data.geo.lng };
  }

  if (data.hours?.length) {
    schema.openingHours = data.hours;
  }

  return schema;
}
