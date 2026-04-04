export function buildCourseSchema(data: {
  name: string;
  description?: string;
  provider?: string;
  url?: string;
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@type": "Course",
    name: data.name,
  };
  if (data.description) schema.description = data.description;
  if (data.provider) {
    schema.provider = { "@type": "Organization", name: data.provider };
  }
  if (data.url) schema.url = data.url;
  return schema;
}
