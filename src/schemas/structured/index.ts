import { buildFaqSchema } from "./faq.js";
import { buildHowToSchema } from "./howto.js";
import { buildProductSchema } from "./product.js";
import { buildLocalBusinessSchema } from "./local-business.js";
import { buildEventSchema } from "./event.js";
import { buildRecipeSchema } from "./recipe.js";
import { buildVideoSchema } from "./video.js";
import { buildCourseSchema } from "./course.js";
import { buildSoftwareSchema } from "./software.js";
import { buildBookSchema } from "./book.js";

export {
  buildFaqSchema,
  buildHowToSchema,
  buildProductSchema,
  buildLocalBusinessSchema,
  buildEventSchema,
  buildRecipeSchema,
  buildVideoSchema,
  buildCourseSchema,
  buildSoftwareSchema,
  buildBookSchema,
};

export type SchemaType = "faq" | "howto" | "product" | "localBusiness" | "event" | "recipe" | "video" | "course" | "software" | "book";

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
    case "recipe":
      return buildRecipeSchema(data as any);
    case "video":
      return buildVideoSchema(data as any);
    case "course":
      return buildCourseSchema(data as any);
    case "software":
      return buildSoftwareSchema(data as any);
    case "book":
      return buildBookSchema(data as any);
    default:
      return null;
  }
}
