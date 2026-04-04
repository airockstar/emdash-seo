import { buildFaqSchema } from "./faq.js";
import { buildHowToSchema } from "./howto.js";
import { buildProductSchema } from "./product.js";
import { buildLocalBusinessSchema } from "./local-business.js";
import { buildEventSchema } from "./event.js";

export { buildFaqSchema, buildHowToSchema, buildProductSchema, buildLocalBusinessSchema, buildEventSchema };

export type SchemaType = "faq" | "howto" | "product" | "localBusiness" | "event";

export function buildSchemaByType(type: SchemaType, data: Record<string, unknown>): Record<string, unknown> | null {
  switch (type) {
    case "faq":
      return buildFaqSchema((data.questions as Array<{ question: string; answer: string }>) ?? []);
    case "howto":
      return buildHowToSchema(data as any);
    case "product":
      return buildProductSchema(data as any);
    case "localBusiness":
      return buildLocalBusinessSchema(data as any);
    case "event":
      return buildEventSchema(data as any);
    default:
      return null;
  }
}
