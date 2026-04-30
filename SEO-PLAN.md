# Plan: Strengthen SEO & GEO for "San Diego Magician"

## TL;DR
The site already has strong foundational SEO (good title, meta, structured data, FAQ schema, reviews). The biggest remaining opportunities are: uncommenting geo/address data in schema, adding geo meta tags, strengthening on-page keyword density in body content, adding semantic entity signals for GEO (Generative Engine Optimization), and expanding structured data with missing types.

## Current Strengths (already in place)
- Title: "San Diego Magician | Mikey Sleighthand"
- H1: "San Diego Magician"
- Meta description with keyword
- LocalBusiness + Person + FAQPage + Review + WebPage schemas
- Aggregate rating from real reviews
- Sitemap, canonical, OG tags, Twitter cards
- Google site verification
- robots.txt allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot)
- llms.txt with structured information
- Area served schema (San Diego, La Jolla, Del Mar, etc.)

## Steps

### Phase 1: Schema & Structured Data Fixes (high impact, quick wins)

- [ ] 1. **Uncomment and populate address + geo coordinates in LocalBusiness schema** — Even without a street address, provide city-level location: `addressLocality: "San Diego"`, `addressRegion: "CA"`, `postalCode: "92101"`, `addressCountry: "US"`, plus GeoCoordinates (32.7157, -117.1611). Google uses these as strong local ranking signals.

- [ ] 2. **Add `sameAs` array to Person and LocalBusiness schemas** — Link to Google Business Profile, Instagram, YouTube, or any other external profiles. These create entity disambiguation signals.

- [ ] 3. **Add standalone `Service` schema** — Create explicit Service entities for "Close-Up Magic Performance" and "Wedding Magic Performance" with `areaServed`, `provider`, and `serviceType` properties tied to San Diego.

- [ ] 4. **Add `BreadcrumbList` schema** — Even for a single page: Home > San Diego Magician. Gives rich snippets in SERPs.

- [ ] 5. **Add `ProfessionalService` as additional @type** — `"@type": ["LocalBusiness", "ProfessionalService"]` signals a professional service explicitly.

### Phase 2: GEO (Generative Engine Optimization) Enhancements

- [ ] 6. **Add geo meta tags to `<head>`** — `geo.region` (US-CA), `geo.placename` (San Diego), `geo.position` (32.7157;-117.1611), and `ICBM` (32.7157, -117.1611). These help AI engines associate the entity with a location.

- [ ] 7. **Expand `llms.txt` with more entity-rich structured content** — Add explicit "Key Facts" section with structured claims: founding year, number of events performed, affiliations, awards. AI engines surface authoritative factual claims. Add a "Frequently Asked Questions" section formatted for easy parsing.

- [ ] 8. **Add `speakable` schema property** — Marks which content is suitable for voice/AI reading. Target the meta description and FAQ answers.

- [ ] 9. **Strengthen on-page visible text with geo+keyword signals** — Add a visible service area paragraph or section near the CTA that naturally mentions "San Diego magician" in context with neighborhoods and event types. The current body copy mentions "San Diego" only once in the CTA section.

### Phase 3: On-Page Content Optimization

- [ ] 10. **Add "San Diego magician" to more body content naturally** — Currently H1 has it, but the "services" section heading is "The Art of Sleight of Hand and Misdirection" — consider making this "San Diego's Finest Sleight of Hand" or adding a subheading that includes the keyword. Target 3-5 natural mentions of the primary keyword in visible body text.

- [ ] 11. **Add location-enriched FAQ entries** — Add 1-2 new FAQ items like "Who is the best magician in San Diego?" / "Where can I hire a magician in San Diego for my event?" — These are high-value GEO queries that AI engines directly answer.

- [ ] 12. **Add alt text audit** — Ensure all images have keyword-relevant alt text (e.g., `alt="San Diego magician Mikey Sleighthand performing close-up magic at corporate event"`).

### Phase 4: Technical SEO

- [ ] 13. **Add security + performance headers in `netlify.toml`** — Cache headers for static assets, `X-Content-Type-Options`, `X-Frame-Options`. Better Core Web Vitals = ranking signal.

- [ ] 14. **Add `<link rel="preload">` for hero image** — Improves LCP (Largest Contentful Paint), a Core Web Vital.

- [ ] 15. **Consider removing jQuery dependency** — 87KB blocking script hurts page load. Not in immediate scope but worth noting.

## Relevant Files
- `src/layouts/Layout.astro` — Uncomment geo/address schema, add geo meta tags, add sameAs, add Service schema, add BreadcrumbList, add speakable
- `src/pages/index.astro` — Strengthen body copy keyword density, add service area visible text
- `src/data/faq.json` — Add 1-2 location-targeted FAQ entries
- `public/llms.txt` — Expand with entity facts and structured Q&A
- `netlify.toml` — Add headers for performance/security
- `public/robots.txt` — Already good, no changes needed

## Verification
1. Run Google Rich Results Test on the deployed URL to validate all structured data
2. Run Lighthouse audit — target 90+ on SEO score
3. Test with Schema.org validator to confirm no errors in JSON-LD
4. Search "San Diego Magician" on Google, Perplexity, and ChatGPT search to monitor GEO visibility
5. Use Google Search Console to verify indexing of FAQ rich results and review stars
6. Validate Core Web Vitals in PageSpeed Insights after header/preload changes

## Decisions
- Address in schema: Use city-level (San Diego, CA 92101) without street address since it appears to be a home-based business (TODO comment suggests info not yet available)
- Keyword density: Target natural inclusion, not stuffing — 3-5 mentions in body text is the sweet spot
- GEO focus: Optimize for AI engines (Perplexity, ChatGPT, Google AI Overviews) via llms.txt enrichment and factual authority signals
- Scope: Homepage only (single-page site), no new pages created

## Further Considerations (Off-Page, No Code Changes)
1. **Google Business Profile** — If not already claimed, this is the #1 off-page factor for local "San Diego Magician" rankings. No code change needed but critical for dominating local pack. Recommend setting up immediately if not done.
2. **Additional pages for topical authority** — A blog post like "Best Corporate Entertainment Ideas in San Diego" or a dedicated "/san-diego-magician" landing page would significantly boost rankings. Currently excluded from scope but highest long-term ROI.
3. **External citations** — Getting listed on Yelp, The Knot, WeddingWire, Thumbtack for "San Diego Magician" category builds domain authority and entity signals that both traditional search and AI engines use.
