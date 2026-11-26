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
- **Resend Email**: Set `RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, and `INQUIRY_FROM_EMAIL` to automatically dispatch structured HTML buyer briefs to your sourcing desk.
- **Webhook Forwarding**: Set `INQUIRY_WEBHOOK_URL` (and optional `INQUIRY_WEBHOOK_SECRET`) to forward structured JSON specifications to a CRM, Slack, or automation endpoint.
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
