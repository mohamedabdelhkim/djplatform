# DJ Platform / EPK / Booking Website

A mobile-first, ultra-fast DJ portfolio, Electronic Press Kit (EPK), and booking platform built with Next.js App Router, Tailwind CSS, and Cloudflare Pages.

---

## 1. Approved Architecture

- **Framework**: Next.js (App Router, TypeScript)
- **Deployment Target**: Cloudflare Pages (`output: 'export'`)
- **Styling**: Tailwind CSS with custom CSS variable design tokens
- **Typography**:
  - **Display**: Space Grotesk
  - **Body**: Inter
  - **Metadata / Technical**: JetBrains Mono
- **Icons**: Lucide Icons
- **Booking Pipeline**:
  - `Browser → Booking Form → BookingService (src/lib/booking-service.ts) → Cloudflare Pages Function (/functions/api/booking.ts) → Resend → DJ / Agent Email`
- **Configuration & Content**: Strongly typed local TypeScript modules designed to be easily replaced by a headless CMS or database in future phases without rewriting UI components.

---

## 2. Architecture Constraints

As specified in `PROJECT_SPEC.pdf`:
- **Static Export Only**: The Next.js application must remain statically exportable.
- **No Dynamic Server Backend**: No dynamic Next.js server runtime. The dev-only API route (`src/app/api/booking/route.ts`) was removed in Phase 3. The single booking endpoint is `functions/api/booking.ts`, a Cloudflare Pages Function that runs outside the Next.js build.
- **Zero Cost / Minimal Infrastructure**: No Firebase, databases, CMS, auth providers, or payment gateways in this phase.
- **Performance**:
  - No Three.js or heavy GSAP animation libraries.
  - Third-party audio embeds (SoundCloud, Spotify, Bandcamp) must use click-to-load facades. External iframes are never initialized until explicit user interaction.
  - Static images configured with fixed aspect ratios and lazy loading.
- **Accessibility**: Target WCAG 2.1 AA with semantic HTML, visible focus states, and respect for `prefers-reduced-motion`.

---

## 3. Design Tokens

| Token | Variable | Value | Description |
| :--- | :--- | :--- | :--- |
| **Background** | `--background` | `#08080A` | Deep black canvas |
| **Surface** | `--surface` | `#111114` | Card & panel background |
| **Active Surface** | `--surface-active` | `#1A1A1F` | Hover & active state background |
| **Border** | `--border` | `#222227` | Structural brutalist borders |
| **Primary Text** | `--text-primary` | `#F2F2F5` | High-contrast body text |
| **Muted Text** | `--text-muted` | `#8C8C99` | Secondary & metadata text |
| **Live / Signal** | `--signal` | `#E02424` | Status signals & live indicators |
| **Action Accent** | `--accent` | `#CCFF00` | High-visibility interactive highlights |

---

## 4. Phase 2: Content Architecture & Typed Domain Models

The content architecture decouples data schemas from presentation components. All data is typed using strict TypeScript definitions and accessed through a dedicated content query layer (`src/lib/content.ts`).

### Domain Models (`src/types/`)

- **`ArtistProfile`** (`src/types/artist.ts`): Artist identity, location, genres, bio lengths (short/medium/long), operational status (`touring` \| `studio` \| `available` \| `offline`), booking availability (`available` \| `limited` \| `closed`), and typed social links.
- **`MusicRelease`** (`src/types/music.ts`): Releases categorized by type (`EP`, `LP`, `Single`, `Remix`, `Compilation`), release dates, catalog numbers, artwork references, descriptions, external platform URLs (Bandcamp, Spotify, Vinyl, etc.), and featured flags.
- **`MixTrack`** (`src/types/music.ts`): Recorded sets and guest mixes, duration, hosting platform (`soundcloud`, `youtube`, `mixcloud`, `spotify`), embed URL for lazy facades, tracklists, and featured flags.
- **`TourEvent`** (`src/types/events.ts`): Live performance dates, venue, city, country, event title, ticket link, confirmation status (`confirmed` \| `sold-out` \| `cancelled` \| `postponed`), and temporal classification (`upcoming` \| `past`).
- **`GalleryImage`** (`src/types/gallery.ts`): Visual media with explicit dimensions, strict aspect ratios (`16:9`, `4:3`, `1:1`, `3:2`, `4:5`), categories (`live`, `studio`, `press`, `editorial`), and priority loading flags.
- **`PressAsset`** & **`PressQuote`** (`src/types/press.ts`): Downloadable EPK assets (press kit archive, technical rider, hospitality rider, high-res photos, vector logos) and press quotes.
- **`BookingRequest`** (`src/types/booking.ts`): Contact name, email, organization, event name, date, location, budget tier, message, and optional reference links.

### Content Configuration (`src/config/`)

All mock data is fictional and clearly demarcated with demo placeholders (`DEMO ARTIST`, `demo@example.com`, `Demo Venue`, `https://example.com/...`):
- `src/config/site.ts`: Site-level metadata and primary navigation.
- `src/config/artist.ts`: Fictional artist biography and social profiles.
- `src/config/music.ts`: Mock EP, LP, single releases, and DJ mixes.
- `src/config/events.ts`: Fictional upcoming and past tour dates.
- `src/config/gallery.ts`: Demonstration gallery references with strict aspect ratios.
- `src/config/press.ts`: Press kit asset downloads, rider documents, and quotes.

### Headless CMS / API Migration Strategy

To ensure zero component rewrites when migrating to a headless CMS (e.g. Sanity, Strapi, Contentful) or database in future phases:
1. **No Direct Config Imports in UI**: UI components import query functions from `src/lib/content.ts` (e.g., `getFeaturedReleases()`, `getUpcomingEvents()`, `getArtistProfile()`), never raw files in `src/config/`.
2. **Identical Return Contracts**: When replacing static files with remote CMS endpoints, only `src/lib/content.ts` needs to be updated to fetch from the CMS client. The TypeScript contracts (`ArtistProfile`, `MusicRelease`, `TourEvent`, etc.) remain identical, leaving all page layouts and components untouched.

---

## 5. Phase 3: UI Component System

Phase 3 extracted reusable UI primitives and refactored all sections and pages to consume them consistently.

### Primitives (`src/components/ui/`)

| Component | File | Purpose |
| :--- | :--- | :--- |
| **Button** | `Button.tsx` | Primary/outline/ghost variants with size options |
| **Badge** | `Badge.tsx` | Status labels with neutral/signal variants |
| **Input** | `Input.tsx` | Styled text input matching design tokens |
| **Textarea** | `Textarea.tsx` | Multi-line input matching design tokens |
| **Select** | `Select.tsx` | Dropdown select matching Input visual language |
| **Card** | `Card.tsx` | Container with `default`, `interactive`, `bordered` variants |
| **AspectRatio** | `AspectRatio.tsx` | Exhaustive aspect-ratio mapper (`16:9`, `4:3`, `1:1`, `3:2`, `4:5`) |
| **SectionHeader** | `SectionHeader.tsx` | Reusable section/page header with index, label, title, optional description, and `h1`/`h2` support |

### Shared Utility

- **`src/lib/utils.ts`**: Canonical `cn()` helper combining `clsx` and `tailwind-merge`. All components import `cn` from this single source.

### Layout Components (`src/components/layout/`)

- **Container** (`Container.tsx`): Responsive max-width wrapper.
- **Header** (`Header.tsx`): Site navigation bar.
- **Footer** (`Footer.tsx`): Site footer.

### Placeholder Assets

`public/` currently contains SVG image placeholders and stub PDF/ZIP files for the press kit. **These must be replaced with real assets before production launch:**
- `public/images/gallery/*.svg` — 6 gallery image placeholders
- `public/images/releases/*.svg` — 4 release artwork placeholders
- `public/images/mixes/*.svg` — 3 mix artwork placeholders
- `public/assets/press/*.pdf` — 2 placeholder PDFs (tech rider, hospitality rider)
- `public/assets/press/*.zip` — 3 placeholder ZIPs (EPK, press photos, logos)

---

## 6. Phase 4: Booking Pipeline & Form System

Phase 4 implemented the end-to-end booking inquiry pipeline with full frontend/backend abstraction, comprehensive client and server validation, and accessible form controls.

### Service Layer (`src/lib/booking-service.ts`)

The `submitBookingRequest` function isolates all transport mechanics from the UI components:
- Encapsulates the API endpoint (`/api/booking`), HTTP headers, and serialization.
- Normalizes server error messages and network failures into a structured `BookingResponse` (`{ success: boolean; message: string }`).
- Guaranteed to never throw unhandled exceptions to the UI layer.

### Form Component (`src/components/sections/BookingSection.tsx`)

The booking form collects the complete 9-field `BookingRequest` domain model:
- `name` (Input, required)
- `email` (Input, type="email", required)
- `organization` (Input, required)
- `eventName` (Input, required)
- `eventDate` (Input, type="date", required)
- `location` (Input, required)
- `budget` (Select, required, options from `BookingBudgetRange`)
- `message` (Textarea, required)
- `websiteUrl` (Input, type="url", optional)

### Accessibility & UX (WCAG 2.1 AA)

- **Semantic Labels**: Every form control has an associated `<label>` element linked via `htmlFor`/`id`.
- **Inline Error Feedback**: On client validation failure, invalid fields are assigned `aria-invalid="true"` and linked to error messages via `aria-describedby`.
- **Status Announcements**: Submission outcomes (success/error) render in an alert banner with `role="status"` and `aria-live="polite"`.
- **Focus Management**: Focus automatically transitions to the status banner upon submit for screen reader and keyboard accessibility.
- **Submission States**: The submit button tracks `"submitting"` state and disables during active network requests.

### Backend Endpoint (`functions/api/booking.ts`)

- Deployed as a Cloudflare Pages Function executing outside the static Next.js export.
- Validates request payloads and dispatches formatted notification emails via Resend.
- Returns HTTP 503 if `RESEND_API_KEY` is missing in production, preventing silent drops.
- Supports explicit development testing via `BOOKING_DEMO_MODE="true"`.

---

## 7. Environment Variables

Configure these environment variables in your Cloudflare Pages project settings:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `BOOKING_NOTIFICATION_EMAIL` | Recipient email address for booking inquiries. | `booking@example.com` |
| `RESEND_API_KEY` | API key from Resend for transactional email dispatch. | `re_...` |
| `BOOKING_FROM_EMAIL` | Verified Resend sender address. Until a domain is verified, omit to use the sandbox sender (delivers only to the Resend account owner). | `"DJ Platform Booking <onboarding@resend.dev>"` |
| `BOOKING_DEMO_MODE` | Set to `"true"` to enable demo mode without `RESEND_API_KEY` (logs inquiries locally without failing). | `"false"` |

---

## 8. Development & Build Scripts

```bash
# Start local development server
npm run dev

# Compile static export to the /out directory
npm run build
```

---

## 9. Deployment (Cloudflare Pages)

Live at `https://djplatform.pages.dev`.

### It must be a Pages project, not a Worker

`functions/api/booking.ts` exports `onRequestPost: PagesFunction<Env>` — Pages
Functions file-based routing, which is a Pages-only feature. A Cloudflare
**Worker** does not read the `functions/` directory, so deploying this repo as a
Worker yields a working static site whose `/api/booking` returns 404.

### Do not accept the Next.js framework preset

Cloudflare detects `next.config.ts` and offers a Next.js preset whose build
command is `npx opennextjs-cloudflare build`. That adapter converts the app into
a Worker with a dynamic runtime, which contradicts `output: 'export'` and fails
the build. The correct settings are:

| Setting | Value |
| :--- | :--- |
| Framework preset | **None** |
| Build command | `npm run build` |
| Build output directory | `out` |

### Deploying from the CLI

The dashboard repeatedly steers Next.js repositories into the Worker/OpenNext
path. The CLI creates a Pages project unambiguously:

```bash
npx wrangler login
npx wrangler pages project create djplatform --production-branch main
npm run build
npx wrangler pages deploy out --project-name djplatform
```

`wrangler pages deploy` uploads `out/` and separately compiles the `functions/`
directory into the Functions bundle. The log line confirming this is
`Uploading Functions bundle`.

### Secrets

Set them interactively so the values never land in a file:

```bash
npx wrangler pages secret put RESEND_API_KEY --project-name djplatform
npx wrangler pages secret put BOOKING_NOTIFICATION_EMAIL --project-name djplatform
```

**Environment variables only take effect on a new deployment.** After adding or
changing one, run `wrangler pages deploy` again — otherwise the Function keeps
using the previous values and returns 503.

### Resend delivery limits

While `BOOKING_FROM_EMAIL` is unset, the Function sends from Resend's sandbox
address, which delivers **only to the address that owns the Resend account**. If
`BOOKING_NOTIFICATION_EMAIL` is any other address, Resend accepts the request and
drops the message: the API reports success and nothing arrives. Verify a domain
in Resend and set `BOOKING_FROM_EMAIL` to send from your own address.

### Node version

`.nvmrc` pins Node 22. Cloudflare reads it; without it the build can run on a
Node older than the 20.9 that Next.js 16 requires.

### Exercising the Function locally

`next dev` does not serve the `functions/` directory, so `/api/booking` returns
404 in local development. To run the real endpoint:

```bash
npm run build
npx wrangler pages dev out
```

---

## 10. Tests

```bash
npm test        # builds, then runs every layer
npm run test:unit   # logic only, no build, ~200ms
```

Uses the built-in `node --test` runner. There are **no test dependencies**: Node
strips the TypeScript itself, and `tests/support/alias-hook.mjs` resolves the
`@/` path alias that `tsconfig.json` defines but Node does not read. Requires
Node 22.18+ (type stripping on by default); `.nvmrc` pins 22.

### Why the suite is shaped this way

Every defect this project has actually shipped passed both `tsc --noEmit` and
`next build`:

| Defect | Type-safe? | Built cleanly? |
| :--- | :--- | :--- |
| Gallery images pinned to 4:3 while five ratios were declared | yes | yes |
| Booking fields with a placeholder but no `<label>` | yes | yes |
| A `Badge` silently dropped from the press page | yes | yes |
| The Function returning `success: true` with no API key set | yes | yes |
| `Toast` left as unreferenced dead code | yes | yes |

None was a type error, so the suite asserts against **behaviour and emitted
HTML**, not types.

### Layers

**`tests/unit/`** — pure logic, no DOM, no build.
- `booking-validation.test.ts`: every required field, whitespace-only input,
  email formats, and an explicit check that the client rejects at least what
  `functions/api/booking.ts` rejects.
- `booking-service.test.ts`: the transport contract against a stubbed `fetch` —
  request shape, error passthrough, and that it never throws and never reports
  success for a 503.
- `content.test.ts`: content invariants — featured items are subsets, upcoming
  and past events partition the schedule, ids are unique, every gallery image
  has real alt text and dimensions matching its declared ratio.

**`tests/build/`** — assertions against the real static export in `out/`.
- Every form control has a matching `<label for>`.
- The status live region is present in the HTML at build time, not mounted only
  when a message appears.
- Every aspect ratio declared in config reaches the page.
- Every asset referenced in config exists in `out/`.
- No `out/api` directory, i.e. no Next.js route has come back.

These were verified by mutation: reintroducing the hardcoded aspect ratio, the
missing label, and the conditional live region each turned the suite red.

### Not covered yet

Contract tests against the deployed Function (`wrangler pages dev` + real
requests to `/api/booking`) are deliberately deferred — they need a server
process and would slow the suite. Until then the endpoint's status codes are
only verified by hand, per the deployment section above.
