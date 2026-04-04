# @emdash-seo/toolkit

The complete SEO toolkit for Emdash CMS -- meta tags, sitemaps, structured data, content analysis, and social sharing.

[![npm version](https://img.shields.io/npm/v/@emdash-seo/toolkit)](https://www.npmjs.com/package/@emdash-seo/toolkit)
[![license](https://img.shields.io/npm/l/@emdash-seo/toolkit)](./LICENSE)
[![tests](https://img.shields.io/badge/tests-505%20passing-brightgreen)]()

---

## Features

### Free Tier

**Meta Tags**
- Configurable title template with `{title}` and `{site}` placeholders
- Customizable title separator (`|`, `-`, `--`, `*`)
- Meta description with length validation
- Robots directive (index/noindex, follow/nofollow) with per-content override
- Canonical URL (auto-detect + manual override)

**OpenGraph**
- `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- `og:site_name`, `og:locale`
- Article-specific tags: `article:published_time`, `article:modified_time`, `article:author`, `article:section`
- Fallback chain: per-content override > page SEO > page data > global defaults

**Twitter Cards**
- Automatic card type selection (`summary` vs `summary_large_image`)
- `twitter:title`, `twitter:description`, `twitter:image`
- `twitter:site` and `twitter:creator` from global settings

**JSON-LD Structured Data**
- `Article` schema for blog posts (headline, datePublished, author, publisher)
- `WebPage` schema for generic pages
- `BreadcrumbList` schema based on URL path
- `Organization` schema from global settings
- `WebSite` schema with `SearchAction` (sitelinks searchbox, homepage only)

**XML Sitemap**
- Auto-generated from all published content
- `<lastmod>`, `<changefreq>`, `<priority>` per entry
- Sitemap index with per-collection splitting
- Respects `noindex` overrides (excluded automatically)

**robots.txt**
- Dynamic generation with configurable allow/disallow rules
- Auto-includes sitemap URL
- Crawl-delay setting

**Site Verification**
- Google Search Console
- Bing Webmaster Tools
- Pinterest
- Yandex

**Analytics Injection**
- Google Analytics 4 (gtag.js)
- Google Tag Manager (head + body noscript)
- Cloudflare Web Analytics
- Facebook Pixel (inline + noscript fallback)
- Custom scripts with head/body placement control

**Content Analysis (Basic)**
- Title length check (30-60 characters optimal)
- Description length check (120-160 characters optimal)
- Focus keyword presence in title and description
- Heading hierarchy validation (single H1, proper nesting)
- Image alt text audit
- OG image validation

**SEO Scoring**
- 0-100 weighted score per content item
- Auto-analyze on content save (`content:afterSave` hook)
- Weekly cron recalculation (Sunday 3am)
- Scores stored for dashboard aggregation

**hreflang / Multi-Language**
- `hreflang` tag generation for multilingual sites
- Configurable language mappings via JSON

**Admin UI**
- SEO Overrides page: table view with inline editing, collection filter, delete
- Content Analysis page: run free/advanced analysis, score badge, check list
- SERP preview (Google search result mock with truncation)
- Social preview (Facebook, Twitter, LinkedIn card previews)
- Character counters with color thresholds on title and description
- Dashboard widgets: SEO Status (missing fields summary) and SEO Score (site-wide average + distribution)
- Inline field widget for content editor SEO fields

### Pro Tier ($49/year)

- **Advanced readability:** Flesch-Kincaid score, passive voice detection, sentence length analysis, transition word usage, paragraph length checks
- **Keyword density analysis** with word-boundary matching
- **Keyword in first paragraph** check
- **Internal link suggestions** based on content similarity
- **Alt text suggestions** from image context
- **Duplicate title/description detection** across the entire site
- **Social auto-posting** to Twitter/X and Bluesky (AT Protocol)
- **Bulk SEO editing** for batch override updates

### Agency Tier ($199/year)

- Multi-site license (up to 999 sites)
- White-label support

---

## Installation

```bash
npm install @emdash-seo/toolkit
```

Then add the plugin to your `live.config.ts`:

```typescript
import seoToolkit from "@emdash-seo/toolkit";

export default {
  plugins: [seoToolkit()],
};
```

---

## Configuration

All settings are managed through the Emdash admin panel. The plugin auto-generates a settings form from the schema below.

### SEO Defaults

| Setting | Description | Default |
|---------|-------------|---------|
| `siteName` | Your site's name, used in title templates and JSON-LD | `""` |
| `titleTemplate` | Title format with `{title}` and `{site}` placeholders | `"{title} \| {site}"` |
| `titleSeparator` | Character between title parts (`\|`, `-`, `--`, `*`) | `"\|"` |
| `defaultOgImage` | Fallback OpenGraph image URL | `""` |
| `twitterHandle` | Site-level Twitter @handle for `twitter:site` | `""` |
| `orgName` | Organization name for JSON-LD `Organization` schema | `""` |
| `orgLogoUrl` | Organization logo URL for JSON-LD | `""` |
| `defaultRobots` | Default robots directive for all pages | `"index, follow"` |

### Analytics & Tracking

| Setting | Description | Default |
|---------|-------------|---------|
| `googleAnalyticsId` | GA4 measurement ID (e.g., `G-XXXXXXX`) | `""` |
| `gtmContainerId` | Google Tag Manager container ID (e.g., `GTM-XXXXXXX`) | `""` |
| `cfAnalyticsToken` | Cloudflare Web Analytics beacon token | `""` |
| `facebookPixelId` | Facebook Pixel ID | `""` |
| `customHeadScripts` | Custom scripts injected into `<head>` | `""` |
| `customBodyScripts` | Custom scripts injected before `</body>` | `""` |

### Sitemap & Indexing

| Setting | Description | Default |
|---------|-------------|---------|
| `sitemapEnabled` | Enable XML sitemap generation | `true` |
| `sitemapExclude` | Comma-separated list of collections to exclude | `""` |
| `sitemapDefaultChangefreq` | Default change frequency (`daily`, `weekly`, `monthly`) | `"weekly"` |
| `sitemapDefaultPriority` | Default priority (0.0-1.0) | `0.5` |
| `robotsTxtCustom` | Custom robots.txt rules (multiline) | `""` |
| `robotsCrawlDelay` | Crawl delay in seconds (0-60) | `0` |

### Site Verification

| Setting | Description | Default |
|---------|-------------|---------|
| `googleVerification` | Google Search Console verification code | `""` |
| `bingVerification` | Bing Webmaster Tools verification code | `""` |
| `pinterestVerification` | Pinterest verification code | `""` |
| `yandexVerification` | Yandex verification code | `""` |

### Social & Sharing

| Setting | Description | Default |
|---------|-------------|---------|
| `enableAutoPost` | Auto-post to social platforms on publish | `false` |
| `twitterApiKey` | Twitter API key (stored as secret) | -- |
| `twitterApiSecret` | Twitter API secret (stored as secret) | -- |
| `blueskyHandle` | Bluesky handle | `""` |
| `blueskyAppPassword` | Bluesky app password (stored as secret) | -- |
| `socialPostTemplate` | Post template with `{title}`, `{url}`, `{description}` | `"New: {title} -- {url}"` |

### Multi-Language

| Setting | Description | Default |
|---------|-------------|---------|
| `hreflangEnabled` | Enable hreflang tag generation | `false` |
| `hreflangMappings` | Language mappings as JSON | `""` |

### Licensing

| Setting | Description |
|---------|-------------|
| `licenseKey` | License key for Pro/Agency features (stored as secret) |

---

## Structured Data

The plugin generates JSON-LD structured data automatically based on page type and context.

### Auto-generated schemas

| Schema | When |
|--------|------|
| `Article` | Content pages with article metadata (publishedTime, author) |
| `WebPage` | All other pages |
| `BreadcrumbList` | All pages (derived from URL path) |
| `Organization` | When `orgName` and `orgLogoUrl` are configured |
| `WebSite` | Homepage only, includes `SearchAction` for sitelinks searchbox |

### Per-content schema types

Set a custom schema type on any content item via the SEO overrides API:

| Schema | `schemaType` value |
|--------|-------------------|
| FAQ | `"faq"` |
| HowTo | `"howto"` |
| Product | `"product"` |
| LocalBusiness | `"localBusiness"` |
| Event | `"event"` |

Use the `schemaData` field to pass type-specific properties:

```typescript
await fetch("/_plugins/@emdash-seo/toolkit/overrides/save", {
  method: "POST",
  body: JSON.stringify({
    contentId: "my-article",
    collection: "posts",
    schemaType: "faq",
    schemaData: {
      questions: [
        { question: "What is Emdash?", answer: "A modern headless CMS." },
      ],
    },
  }),
});
```

---

## API Routes

All routes are available at `/_plugins/@emdash-seo/toolkit/<route>`.

| Route | Auth | Description |
|-------|------|-------------|
| `overrides/save` | Admin | Save SEO overrides for a content item |
| `overrides/get` | Admin | Get SEO overrides for a content item |
| `overrides/list` | Admin | List all overrides (paginated, filterable by collection) |
| `overrides/delete` | Admin | Delete overrides for a content item |
| `overrides/bulk-save` | Admin | Bulk save overrides (Pro) |
| `sitemap-xml` | Public | XML sitemap or sitemap index |
| `sitemap-collection` | Public | Per-collection XML sitemap |
| `robots-txt` | Public | Dynamic robots.txt |
| `analytics/status` | Admin | SEO audit summary (missing titles, descriptions, OG images) |
| `analyze` | Admin | Run basic content analysis (free) |
| `analyze/advanced` | Admin | Run full content analysis (Pro) |
| `analyze/link-suggestions` | Admin | Get internal link suggestions (Pro) |
| `scores/list` | Admin | List SEO scores (paginated, filterable by collection) |
| `social/post` | Admin | Post to social platforms (Pro) |
| `social/history` | Admin | View social posting history (paginated) |
| `license/validate` | Admin | Validate and store a license key |
| `license/status` | Admin | Check current license status and tier |

---

## Development

```bash
pnpm install        # install dependencies
pnpm dev            # watch mode (TypeScript compiler)
pnpm test           # run tests (vitest)
pnpm typecheck      # type check
pnpm lint           # lint (oxlint)
pnpm build          # build
```

The test suite contains 505 tests across 46 files covering hooks, routes, analysis, schemas, admin components, and utilities.

---

## Architecture

The plugin is built on the Emdash plugin API (`definePlugin`) and runs on the Cloudflare Workers runtime.

### Hooks

| Hook | Purpose |
|------|---------|
| `page:metadata` | Generates meta tags, OpenGraph, Twitter Cards, and JSON-LD |
| `page:fragments` | Injects analytics scripts, verification tags, and hreflang |
| `content:afterSave` | Auto-analyzes content on save, triggers social auto-posting |
| `cron` | Weekly SEO score recalculation |
| `plugin:install` / `plugin:activate` | Lifecycle management |

### Capabilities

- `read:content` -- read content for analysis and sitemap generation
- `read:users` -- read user data for author attribution
- `read:media` -- validate OG images
- `page:inject` -- inject scripts and tags into page output
- `network:fetch` -- call external APIs (Twitter, Bluesky)

### Storage Collections

| Collection | Purpose | Key Indexes |
|------------|---------|-------------|
| `overrides` | Per-content SEO field overrides | `contentId` (unique), `collection` |
| `scores` | SEO analysis scores | `contentId` (unique), `collection`, `score` |
| `socialPosts` | Social posting history | `contentId`, `platform`, `postedAt` |

### Admin UI

React-based admin interface with two pages (SEO Overrides, Content Analysis), two dashboard widgets (SEO Status, SEO Score), and an inline field widget for the content editor. Uses a design system with shared tokens, global styles, and reusable components (SerpPreview, SocialPreview, CharacterCounter, ScoreBadge).

---

## License

MIT
