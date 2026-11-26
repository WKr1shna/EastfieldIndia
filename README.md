# EastField India — Bihar-Origin Makhana B2B Platform

EastField India is a Bihar-origin makhana (*Euryale ferox*) sourcing, aggregation, and B2B supply business operating around the Purnea and Katihar sourcing ecosystem.

## Architecture Overview

- **Framework**: Next.js App Router (TypeScript, React 19, Tailwind CSS v4)
- **Rendering & CDN Scalability (200+ Concurrent Users)**:
  - The marketing site is statically pre-rendered at build time (`SSG`) so page visits incur zero per-request server rendering overhead and can be served directly from any CDN edge.
  - Optimized responsive images via `next/image` (AVIF/WebP negotiation, lazy loading below the fold, immutable asset cache headers).
  - Stateless API routes (`/api/inquiries`, `/api/health`) with zero in-memory user session state.
  - Distributed rate limiting via Upstash Redis REST (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`) with a bounded non-blocking local sliding-window fallback.
  - Non-blocking asynchronous inquiry persistence (`INQUIRY_WEBHOOK_URL` or NDJSON append store) and REST email delivery via Resend (`RESEND_API_KEY`).

## Directory Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── health/route.ts
│   │   └── inquiries/route.ts
│   ├── icon.svg
│   ├── layout.tsx
│   ├── page.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── footer/Footer.tsx
│   ├── forms/InquiryFormSection.tsx
│   ├── hero/HeroSection.tsx
│   ├── navigation/Header.tsx
│   ├── sections/
│   │   ├── B2BBuyersSection.tsx
│   │   ├── FounderStorySection.tsx
│   │   ├── MakhanaGradesSection.tsx
│   │   ├── ProcurementSection.tsx
│   │   ├── QualitySection.tsx
│   │   ├── SourcingRegionSection.tsx
│   │   └── WhoWeAreSection.tsx
│   └── ui/
│       ├── BrandMark.tsx
│       ├── InquiryContext.tsx
│       └── Reveal.tsx
├── config/site.ts
├── features/
│   ├── procurement/stages.ts
│   ├── products/grades.ts
│   ├── quality/parameters.ts
│   └── sourcing/ecosystems.ts
├── services/
│   ├── emailService.ts
│   ├── inquiryRepository.ts
│   └── rateLimit.ts
├── styles/globals.css
└── validations/inquiry.ts
```

## Setup & Environment Variables

Copy `.env.example` to `.env.local` and configure as needed:

```bash
cp .env.example .env.local
```

### Email & Storage Configuration
- **Resend Email**: Set `RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, and `INQUIRY_FROM_EMAIL` to automatically dispatch structured HTML business enquiries and sample requests to your sourcing desk.
- **Database / Webhook Persistence**: `sql/schema.sql` provides the indexed PostgreSQL/Supabase schema (`business_leads`) supporting deduplicated lead capture across entry lead popups, general enquiries, and sample requests. Set `INQUIRY_WEBHOOK_URL` (and optional `INQUIRY_WEBHOOK_SECRET`) to forward leads directly to your database API/CRM, or use the built-in non-blocking NDJSON upsert fallback (`INQUIRY_STORAGE_PATH` / `.data/leads.ndjson`).
- **Admin Lead Export API**: Set `ADMIN_API_KEY` (minimum 16 characters) to enable authenticated access to `GET /api/admin/leads` (`Authorization: Bearer <ADMIN_API_KEY>`), supporting `?format=csv`, `?requestedSample=true|false`, and `?dateFrom=...&dateTo=...` filters.
- **Address Autocomplete & Structured Shipping**: Uses semantic HTML5 `autoComplete` tokens (`address-line1`, `address-line2`, `address-level2`, `address-level1`, `postal-code`, `country-name`) with a searchable international country selector and country-aware postal code validation, requiring zero external paid API keys while allowing manual editing of every field.
- **Distributed Rate Limiting**: Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` when deploying across multiple serverless/container instances.

## Scripts

```bash
npm run dev         # Start local development server
npm run build       # Production build
npm run start       # Start production server
npm run lint        # Run ESLint
npm run typecheck   # Run TypeScript compiler check
npm test            # Run unit & integration test suite (Vitest)
```

## Image Attribution

- Real Bihar fox nut (makhana) photography incorporated into `public/images/grades/6-suta.jpg` and `public/images/grades/6-plus-suta.jpg` incorporates [Foxnut Makhana - Nawada District - Bihar - 1.jpg](https://commons.wikimedia.org/wiki/File:Foxnut_Makhana_-_Nawada_District_-_Bihar_-_1.jpg) via Wikimedia Commons (CC BY-SA 4.0).
