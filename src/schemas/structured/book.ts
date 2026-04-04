export function buildBookSchema(data: {
  name: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  datePublished?: string;
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@type": "Book",
    name: data.name,
  };
  if (data.author) schema.author = { "@type": "Person", name: data.author };
  if (data.isbn) schema.isbn = data.isbn;
  if (data.publisher) schema.publisher = { "@type": "Organization", name: data.publisher };
  if (data.datePublished) schema.datePublished = data.datePublished;
  return schema;
}
