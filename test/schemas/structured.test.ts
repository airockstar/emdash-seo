import { describe, it, expect } from "vitest";
import {
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
  buildSchemaByType,
} from "../../src/schemas/structured/index.js";

describe("buildFaqSchema", () => {
  it("builds FAQPage with questions", () => {
    const result = buildFaqSchema([
      { question: "What is SEO?", answer: "Search Engine Optimization" },
      { question: "Why SEO?", answer: "To rank higher" },
    ]);
    expect(result["@type"]).toBe("FAQPage");
    expect((result.mainEntity as any[]).length).toBe(2);
    expect((result.mainEntity as any[])[0].name).toBe("What is SEO?");
  });

  it("handles empty questions", () => {
    const result = buildFaqSchema([]);
    expect(result["@type"]).toBe("FAQPage");
    expect((result.mainEntity as any[]).length).toBe(0);
  });
});

describe("buildHowToSchema", () => {
  it("builds HowTo with steps", () => {
    const result = buildHowToSchema({
      name: "Fix a Bike",
      steps: [
        { name: "Step 1", text: "Remove the wheel" },
        { name: "Step 2", text: "Patch the tire" },
      ],
    });
    expect(result["@type"]).toBe("HowTo");
    expect(result.name).toBe("Fix a Bike");
    expect((result.step as any[]).length).toBe(2);
    expect((result.step as any[])[0].position).toBe(1);
  });

  it("includes totalTime when provided", () => {
    const result = buildHowToSchema({ name: "Test", steps: [], totalTime: "PT30M" });
    expect(result.totalTime).toBe("PT30M");
  });
});

describe("buildProductSchema", () => {
  it("builds Product with offers", () => {
    const result = buildProductSchema({
      name: "Widget",
      price: 29.99,
      currency: "USD",
      availability: "InStock",
    });
    expect(result["@type"]).toBe("Product");
    expect((result.offers as any).price).toBe(29.99);
    expect((result.offers as any).priceCurrency).toBe("USD");
  });

  it("includes aggregate rating", () => {
    const result = buildProductSchema({ name: "Widget", ratingValue: 4.5, reviewCount: 120 });
    expect((result.aggregateRating as any).ratingValue).toBe(4.5);
  });
});

describe("buildLocalBusinessSchema", () => {
  it("builds LocalBusiness with address", () => {
    const result = buildLocalBusinessSchema({
      name: "Pizza Place",
      address: { street: "123 Main St", city: "Springfield", country: "US" },
      phone: "+1-555-0123",
    });
    expect(result["@type"]).toBe("LocalBusiness");
    expect((result.address as any).streetAddress).toBe("123 Main St");
    expect(result.telephone).toBe("+1-555-0123");
  });

  it("includes geo coordinates", () => {
    const result = buildLocalBusinessSchema({ name: "Shop", geo: { lat: 40.7128, lng: -74.006 } });
    expect((result.geo as any).latitude).toBe(40.7128);
  });
});

describe("buildEventSchema", () => {
  it("builds Event with all fields", () => {
    const result = buildEventSchema({
      name: "Concert",
      startDate: "2026-06-15T20:00:00Z",
      location: "Madison Square Garden",
      performer: "Artist Name",
    });
    expect(result["@type"]).toBe("Event");
    expect(result.startDate).toBe("2026-06-15T20:00:00Z");
    expect((result.location as any).name).toBe("Madison Square Garden");
    expect((result.performer as any).name).toBe("Artist Name");
  });
});

describe("buildRecipeSchema", () => {
  it("builds Recipe with all fields", () => {
    const result = buildRecipeSchema({
      name: "Pancakes",
      description: "Fluffy pancakes",
      image: "https://example.com/pancakes.jpg",
      ingredients: ["flour", "eggs", "milk"],
      instructions: [{ text: "Mix ingredients" }, { text: "Cook on griddle" }],
      cookTime: "PT15M",
      prepTime: "PT10M",
      recipeYield: "4 servings",
      nutrition: { calories: "350 calories" },
    });
    expect(result["@type"]).toBe("Recipe");
    expect(result.name).toBe("Pancakes");
    expect(result.recipeIngredient).toEqual(["flour", "eggs", "milk"]);
    expect((result.recipeInstructions as any[]).length).toBe(2);
    expect((result.recipeInstructions as any[])[0]["@type"]).toBe("HowToStep");
    expect(result.cookTime).toBe("PT15M");
    expect((result.nutrition as any).calories).toBe("350 calories");
  });

  it("builds minimal Recipe", () => {
    const result = buildRecipeSchema({ name: "Toast" });
    expect(result["@type"]).toBe("Recipe");
    expect(result.name).toBe("Toast");
    expect(result).not.toHaveProperty("recipeIngredient");
  });
});

describe("buildVideoSchema", () => {
  it("builds VideoObject with all fields", () => {
    const result = buildVideoSchema({
      name: "Tutorial",
      description: "A tutorial video",
      thumbnailUrl: "https://example.com/thumb.jpg",
      uploadDate: "2026-01-15",
      duration: "PT10M",
      contentUrl: "https://example.com/video.mp4",
    });
    expect(result["@type"]).toBe("VideoObject");
    expect(result.name).toBe("Tutorial");
    expect(result.duration).toBe("PT10M");
    expect(result.contentUrl).toBe("https://example.com/video.mp4");
  });

  it("builds minimal VideoObject", () => {
    const result = buildVideoSchema({
      name: "Clip",
      description: "A clip",
      thumbnailUrl: "https://example.com/thumb.jpg",
      uploadDate: "2026-01-15",
    });
    expect(result["@type"]).toBe("VideoObject");
    expect(result).not.toHaveProperty("duration");
  });
});

describe("buildCourseSchema", () => {
  it("builds Course with provider", () => {
    const result = buildCourseSchema({
      name: "Intro to SEO",
      description: "Learn SEO basics",
      provider: "Acme University",
      url: "https://example.com/courses/seo",
    });
    expect(result["@type"]).toBe("Course");
    expect(result.name).toBe("Intro to SEO");
    expect((result.provider as any).name).toBe("Acme University");
  });

  it("builds minimal Course", () => {
    const result = buildCourseSchema({ name: "Quick Course" });
    expect(result["@type"]).toBe("Course");
    expect(result).not.toHaveProperty("provider");
  });
});

describe("buildSoftwareSchema", () => {
  it("builds SoftwareApplication with offers", () => {
    const result = buildSoftwareSchema({
      name: "MyApp",
      description: "A great app",
      operatingSystem: "Windows, macOS",
      applicationCategory: "BusinessApplication",
      price: 9.99,
      currency: "USD",
    });
    expect(result["@type"]).toBe("SoftwareApplication");
    expect(result.operatingSystem).toBe("Windows, macOS");
    expect((result.offers as any).price).toBe(9.99);
  });

  it("builds minimal SoftwareApplication", () => {
    const result = buildSoftwareSchema({ name: "FreeApp" });
    expect(result["@type"]).toBe("SoftwareApplication");
    expect(result).not.toHaveProperty("offers");
  });
});

describe("buildBookSchema", () => {
  it("builds Book with all fields", () => {
    const result = buildBookSchema({
      name: "The Great Novel",
      author: "Jane Author",
      isbn: "978-3-16-148410-0",
      publisher: "Big Publisher",
      datePublished: "2025-06-01",
    });
    expect(result["@type"]).toBe("Book");
    expect((result.author as any).name).toBe("Jane Author");
    expect(result.isbn).toBe("978-3-16-148410-0");
    expect((result.publisher as any).name).toBe("Big Publisher");
  });

  it("builds minimal Book", () => {
    const result = buildBookSchema({ name: "Short Story" });
    expect(result["@type"]).toBe("Book");
    expect(result).not.toHaveProperty("author");
  });
});

describe("buildSchemaByType", () => {
  it("dispatches to FAQ builder", () => {
    const result = buildSchemaByType("faq", { questions: [{ question: "Q", answer: "A" }] });
    expect(result?.["@type"]).toBe("FAQPage");
  });

  it("dispatches to HowTo builder", () => {
    const result = buildSchemaByType("howto", { name: "Test", steps: [] });
    expect(result?.["@type"]).toBe("HowTo");
  });

  it("dispatches to Product builder", () => {
    const result = buildSchemaByType("product", { name: "Widget" });
    expect(result?.["@type"]).toBe("Product");
  });

  it("dispatches to LocalBusiness builder", () => {
    const result = buildSchemaByType("localBusiness", { name: "Shop" });
    expect(result?.["@type"]).toBe("LocalBusiness");
  });

  it("dispatches to Event builder", () => {
    const result = buildSchemaByType("event", { name: "Concert", startDate: "2026-01-01" });
    expect(result?.["@type"]).toBe("Event");
  });

  it("dispatches to Recipe builder", () => {
    const result = buildSchemaByType("recipe", { name: "Pancakes" });
    expect(result?.["@type"]).toBe("Recipe");
  });

  it("dispatches to Video builder", () => {
    const result = buildSchemaByType("video", { name: "Clip", description: "A clip", thumbnailUrl: "https://example.com/t.jpg", uploadDate: "2026-01-01" });
    expect(result?.["@type"]).toBe("VideoObject");
  });

  it("dispatches to Course builder", () => {
    const result = buildSchemaByType("course", { name: "SEO 101" });
    expect(result?.["@type"]).toBe("Course");
  });

  it("dispatches to Software builder", () => {
    const result = buildSchemaByType("software", { name: "MyApp" });
    expect(result?.["@type"]).toBe("SoftwareApplication");
  });

  it("dispatches to Book builder", () => {
    const result = buildSchemaByType("book", { name: "Novel" });
    expect(result?.["@type"]).toBe("Book");
  });

  it("returns null for unknown type", () => {
    const result = buildSchemaByType("unknown" as any, {});
    expect(result).toBeNull();
  });
});
