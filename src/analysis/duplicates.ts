import type { SeoCheck, SeoOverrides } from "../types.js";

function checkDuplicate(
  field: "title" | "description",
  value: string | undefined,
  allOverrides: Array<{ id: string; data: SeoOverrides }>,
  currentId: string,
): SeoCheck {
  const id = field === "title" ? "duplicate-title" : "duplicate-desc";
  const label = field === "title" ? "Duplicate Title" : "Duplicate Description";
  const noun = field === "title" ? "Title" : "Description";

  if (!value) {
    return { id, label, status: "warn", message: `No ${noun.toLowerCase()} to check`, weight: 5 };
  }

  const valueLower = value.toLowerCase();
  const duplicates = allOverrides.filter((o) => {
    if (o.id === currentId) return false;
    const otherValue = field === "title" ? o.data.title : o.data.description;
    return otherValue?.toLowerCase() === valueLower;
  });

  if (duplicates.length > 0) {
    return { id, label, status: "fail", message: `${noun} is duplicated across ${duplicates.length} other item(s)`, weight: 5 };
  }
  return { id, label, status: "pass", message: `${noun} is unique`, weight: 5 };
}

export function checkDuplicateTitle(
  title: string | undefined,
  allOverrides: Array<{ id: string; data: SeoOverrides }>,
  currentId: string,
): SeoCheck {
  return checkDuplicate("title", title, allOverrides, currentId);
}

export function checkDuplicateDescription(
  description: string | undefined,
  allOverrides: Array<{ id: string; data: SeoOverrides }>,
  currentId: string,
): SeoCheck {
  return checkDuplicate("description", description, allOverrides, currentId);
}
