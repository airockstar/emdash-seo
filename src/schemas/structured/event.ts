export function buildEventSchema(data: {
  name: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
  image?: string;
  performer?: string;
  url?: string;
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@type": "Event",
    name: data.name,
    startDate: data.startDate,
  };
  if (data.endDate) schema.endDate = data.endDate;
  if (data.description) schema.description = data.description;
  if (data.image) schema.image = data.image;
  if (data.url) schema.url = data.url;
  if (data.location) {
    schema.location = { "@type": "Place", name: data.location };
  }
  if (data.performer) {
    schema.performer = { "@type": "Person", name: data.performer };
  }
  return schema;
}
