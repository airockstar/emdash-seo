import type { PublicPageContext } from "../../src/types.js";

export const articlePage: PublicPageContext = {
  url: "https://example.com/blog/my-post",
  path: "/blog/my-post",
  locale: "en",
  kind: "content",
  pageType: "post",
  title: "My Blog Post",
  description: "A great blog post about testing SEO plugins.",
  canonical: "https://example.com/blog/my-post",
  image: "https://example.com/images/post.jpg",
  content: { collection: "posts", id: "post-1", slug: "my-post" },
  articleMeta: {
    publishedTime: "2026-01-15T10:00:00Z",
    modifiedTime: "2026-02-01T14:30:00Z",
    author: "Jane Doe",
  },
};

export const genericPage: PublicPageContext = {
  url: "https://example.com/about",
  path: "/about",
  locale: "en",
  kind: "custom",
  pageType: "page",
  title: "About Us",
  description: "Learn more about our company.",
  canonical: "https://example.com/about",
  image: "",
};

export const homePage: PublicPageContext = {
  url: "https://example.com/",
  path: "/",
  locale: "en",
  kind: "custom",
  pageType: "page",
  title: "Home",
  description: "Welcome to our website.",
  canonical: "https://example.com/",
  image: "https://example.com/images/og-default.jpg",
};

export const noSeoPage: PublicPageContext = {
  url: "https://example.com/plain",
  path: "/plain",
  locale: "en",
  kind: "custom",
  pageType: "page",
  title: "Plain Page",
  description: "",
  canonical: "",
  image: "",
};
