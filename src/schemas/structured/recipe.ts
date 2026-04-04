export function buildRecipeSchema(data: {
  name: string;
  description?: string;
  image?: string;
  ingredients?: string[];
  instructions?: Array<{ text: string }>;
  cookTime?: string;
  prepTime?: string;
  recipeYield?: string;
  nutrition?: { calories?: string };
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@type": "Recipe",
    name: data.name,
  };
  if (data.description) schema.description = data.description;
  if (data.image) schema.image = data.image;
  if (data.ingredients) schema.recipeIngredient = data.ingredients;
  if (data.instructions) {
    schema.recipeInstructions = data.instructions.map((step) => ({
      "@type": "HowToStep",
      text: step.text,
    }));
  }
  if (data.cookTime) schema.cookTime = data.cookTime;
  if (data.prepTime) schema.prepTime = data.prepTime;
  if (data.recipeYield) schema.recipeYield = data.recipeYield;
  if (data.nutrition?.calories) {
    schema.nutrition = { "@type": "NutritionInformation", calories: data.nutrition.calories };
  }
  return schema;
}
