export function buildHowToSchema(data: {
  name: string;
  description?: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  totalTime?: string;
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@type": "HowTo",
    name: data.name,
  };
  if (data.description) schema.description = data.description;
  if (data.totalTime) schema.totalTime = data.totalTime;

  schema.step = data.steps.map((s, i) => {
    const step: Record<string, unknown> = {
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    };
    if (s.image) step.image = s.image;
    return step;
  });

  return schema;
}
