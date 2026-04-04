export function buildVideoSchema(data: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@type": "VideoObject",
    name: data.name,
    description: data.description,
    thumbnailUrl: data.thumbnailUrl,
    uploadDate: data.uploadDate,
  };
  if (data.duration) schema.duration = data.duration;
  if (data.contentUrl) schema.contentUrl = data.contentUrl;
  return schema;
}
