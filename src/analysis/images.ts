import type { SeoCheck } from "../types.js";
import type { ImageRef } from "../utils/portable-text.js";

export function checkImageAltText(images: ImageRef[]): SeoCheck {
  if (images.length === 0) {
    return { id: "image-alt", label: "Image Alt Text", status: "pass", message: "No images to check", weight: 5 };
  }

  const missing = images.filter((img) => !img.alt);
  if (missing.length === 0) {
    return { id: "image-alt", label: "Image Alt Text", status: "pass", message: `All ${images.length} images have alt text`, weight: 5 };
  }

  return {
    id: "image-alt",
    label: "Image Alt Text",
    status: "fail",
    message: `${missing.length} of ${images.length} images missing alt text`,
    weight: 5,
  };
}
