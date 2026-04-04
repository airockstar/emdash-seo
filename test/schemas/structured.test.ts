import { describe, it, expect } from "vitest";
import {
  buildFaqSchema,
  buildHowToSchema,
  buildProductSchema,
  buildLocalBusinessSchema,
  buildEventSchema,
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

  it("returns null for unknown type", () => {
    const result = buildSchemaByType("unknown" as any, {});
    expect(result).toBeNull();
  });
});
