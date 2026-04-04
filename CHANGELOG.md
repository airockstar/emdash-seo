# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-04

Initial release of @emdash-seo/toolkit.

### Added

#### Core Meta Tags
- Configurable title template with `{title}` and `{site}` placeholders and selectable separator
- Meta description generation with length validation
- Robots directive (index/noindex, follow/nofollow) with per-content override
- Canonical URL with auto-detection and manual override support

#### OpenGraph & Twitter Cards
- Full OpenGraph support: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`, `og:locale`
- Article-specific OG tags: `article:published_time`, `article:modified_time`, `article:author`, `article:section`
- Four-level fallback chain: per-content override > page SEO > page data > global defaults
- Twitter Card support with automatic card type selection (`summary` / `summary_large_image`)
- `twitter:site` and `twitter:creator` from global settings

#### JSON-LD Structured Data
- `Article` schema for blog posts (headline, datePublished, dateModified, author, publisher)
- `WebPage` schema for generic pages
- `BreadcrumbList` schema derived from URL path
- `Organization` schema from global settings (name, logo)
- `WebSite` schema with `SearchAction` for sitelinks searchbox (homepage only)
- Multi-type schema generator for per-content types: FAQ, HowTo, Product, LocalBusiness, Event

#### Sitemap & Indexing
- XML sitemap auto-generated from all published content with `<lastmod>`, `<changefreq>`, `<priority>`
- Sitemap index with per-collection splitting for multi-collection sites
- Automatic exclusion of `noindex` pages from sitemap
- Dynamic `robots.txt` generation with configurable allow/disallow rules and crawl delay
- Site verification meta tags for Google, Bing, Pinterest, and Yandex

#### Analytics & Tracking
- Google Analytics 4 (gtag.js) script injection
- Google Tag Manager injection (head script + body noscript iframe)
- Cloudflare Web Analytics beacon injection
- Facebook Pixel injection (inline script + noscript fallback)
- Custom script injection with head/body placement control
- Input validation on all provider IDs via regex patterns

#### Per-Content SEO Overrides
- Storage collection with indexes on `contentId` and `collection`
- CRUD routes: save, get, list (paginated), delete
- Override fields: title, description, ogImage, robots, canonical, focusKeyword, schemaType, schemaData

#### Content Analysis (Free)
- Title length check (30-60 characters optimal)
- Description length check (120-160 characters optimal)
- Focus keyword presence in title and description
- Heading hierarchy validation (single H1, proper nesting)
- Image alt text audit
- OG image validation via media API
- SEO scoring: weighted 0-100 score per content item
- Auto-analyze on content save via `content:afterSave` hook
- Weekly cron job for site-wide score recalculation (Sunday 3am)

#### Content Analysis (Pro)
- Flesch-Kincaid readability score
- Passive voice detection
- Sentence length analysis
- Transition word usage check
- Paragraph length analysis
- Keyword density analysis with word-boundary matching
- Keyword in first paragraph check
- Internal link count check
- Duplicate title detection across the site
- Duplicate description detection across the site
- Internal link suggestions based on content similarity
- Alt text suggestions from image context

#### Social Sharing (Pro)
- Twitter/X adapter with OAuth 2.0 client credentials
- Bluesky adapter with AT Protocol session auth
- Social post template with `{title}`, `{url}`, `{description}` placeholders
- Auto-post on publish via `content:afterSave` hook
- Deduplication via `socialPosts` storage collection
- Parallel platform posting with `Promise.allSettled`
- Manual post trigger and posting history routes

#### Bulk Editing (Pro)
- Bulk save route for batch SEO override updates

#### Licensing
- JWT RS256 license validation with 3-tier model (free, pro, agency)
- License key storage in KV settings
- Feature gating via `isFeatureAllowed()` with tier-based access control
- 7-day grace period on expired license keys
- License validate and status routes

#### hreflang / Multi-Language
- `hreflang` tag generation for multilingual sites
- Configurable language mappings via JSON setting

#### Admin UI
- SEO Overrides page: table view with inline editing, collection filter, SERP preview, character counters
- Content Analysis page: content ID input, free/advanced analysis buttons, score badge, check list
- SEO Status dashboard widget: missing fields summary (titles, descriptions, OG images)
- SEO Score dashboard widget: site-wide average with good/fair/poor distribution
- Inline field widget for content editor SEO fields
- Shared components: SerpPreview, SocialPreview, CharacterCounter, ScoreBadge
- Design system with tokens, global styles, and shared component library

#### Performance
- KV read consolidation: reduced from 18 reads/page to 3-4 via batched `Promise.all`
- `fetchAllContent` utility with cursor-based pagination for sitemap and analysis

#### Testing
- 505 tests across 46 files
- Coverage: hooks, routes, analysis checks, schemas, admin components, utilities, social adapters, licensing

[0.1.0]: https://github.com/airockstar/emdash-seo/releases/tag/v0.1.0
