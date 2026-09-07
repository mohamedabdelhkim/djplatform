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
| `BOOKING_RATE_LIMIT` | KV namespace **binding** (not a variable), set under Settings → Bindings. Optional: without it the endpoint is unthrottled. | — |
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

Live at `https://djplatform.dpdns.org` (the `djplatform.pages.dev` address
still serves the same deployment).

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

### Automated deploys

Cloudflare Pages builds and deploys on every push to `main`. Settings:

| Setting | Value |
| :--- | :--- |
| Framework preset | **None** |
| Build command | **`npm test`** |
| Build output directory | `out` |
| Production branch | `main` |

The build command is `npm test`, not `npm run build`. `npm test` builds *and*
then runs the full suite, and exits non-zero if anything fails, so Cloudflare
aborts the deployment. That makes the native Git integration test-gated without
any external CI.

Do not accept the **Next.js** framework preset. It sets the build command to
`npx opennextjs-cloudflare build`, an adapter that converts the app to a Worker
with a dynamic runtime — which contradicts `output: 'export'` and fails the
build.

The tests need Node 22.18+ for built-in type stripping. `.nvmrc` pins 22 and
Cloudflare reads it; if a build ever fails inside the test runner, set a
`NODE_VERSION` environment variable to an explicit 22.18+ patch release.

### Deploying by hand

```bash
npm run deploy
```

Runs the whole suite and only then uploads, so a broken build cannot reach
production even when deploying manually. Use this rather than calling
`wrangler pages deploy` directly.

### Keeping dependencies current

`.github/dependabot.yml` watches npm packages weekly and GitHub Actions monthly,
opening a pull request when something needs updating. Routine minor and patch
bumps are grouped into one PR; security fixes arrive separately so they are not
buried in the noise.

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

**`npm run typecheck:functions`** — `functions/` targets the Workers runtime, so
it sits outside the app's `tsconfig.json` and was going unchecked despite holding
every server-side protection. It has its own config now and runs first in
`npm test`.

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

---

## 11. Security posture

`/api/booking` is public, unauthenticated, and spends money (Resend quota) on
every accepted request. It is the only attack surface that costs anything.

### What is enforced

| Control | Where | Behaviour |
| :--- | :--- | :--- |
| Body size cap (64 KB) | `functions/api/booking.ts` | 413 before the JSON is parsed |
| Per-field length limits | Function, mirrored in `booking-validation.ts` | 400 naming the field |
| Honeypot (`contact_reference`) | Hidden input + Function | 200 with nothing dispatched |
| Configuration shape check | `findConfigProblem()`, before request parsing | 503 naming the wrong variable |
| Per-IP throttle (Workers KV) | `withinRateLimit()` in the Function | 429 after 5 requests in 10 minutes |
| Cloudflare Turnstile | Widget on the form + `siteverify` in the Function | 403 on a missing or rejected token |
| Subject sanitisation | `sanitizeHeaderValue()` | CR/LF and control characters stripped, truncated |
| Security headers | `public/_headers` | CSP `frame-ancestors`, HSTS, XFO, Permissions-Policy, COOP |

Before these, a 4.8 MB payload was accepted and parsed, and twelve requests in a
row were processed without any throttling.

The honeypot is deliberately **not** named `company`, `organization` or `fax`.
Those are browser autofill tokens; a browser filling the trap for a real visitor
would discard a genuine booking while showing them a success message.

### Configuration validation

`findConfigProblem()` runs before anything else in the Function and checks the
*shape* of the environment: that `RESEND_API_KEY` starts with `re_`, that
`BOOKING_NOTIFICATION_EMAIL` is an address, and — named explicitly — that it is
not itself a Resend key.

That last case is not hypothetical. On 6 September both secrets were set to the
Resend key. Everything downstream behaved: the Function ran, Resend
authenticated, and only Resend's own field validation caught it, as a 502 that
named nothing. Every booking failed for hours. The check now answers 503 with
`BOOKING_NOTIFICATION_EMAIL holds a Resend API key, not an email address — the
two secrets are swapped`.

It runs **before request parsing** on purpose. A misconfigured endpoint is broken
for everyone, so it must not look like a client error — and running first means
the uptime monitor's probe, which expects 400, sees the 503 instead and alerts
within fifteen minutes. A silent configuration mistake becomes a page.

The logic lives in `src/lib/booking-config.ts` rather than inside the Function so
it carries no Workers types and can be unit tested, the same split already used
for `booking-validation.ts`.

It checks shape, not correctness: nothing here can tell whether an address is the
right mailbox, only that it is an address at all — which is what was broken.

### Turnstile

The site key is public and lives in `BookingSection.tsx`; `TURNSTILE_SECRET_KEY`
is a Pages secret. Verification checks `action` and `hostname` as well as
`success` — without those, a token minted for any other widget on the account
would be accepted here.

A missing or rejected token is refused with 403. A **missing secret** is only
logged, and verification is skipped: enforcing a dependency that had never been
observed working is exactly what took bookings down for forty minutes on
6 September. The honeypot, throttle, size cap and length limits all still apply.

**It cannot be verified from a headless or embedded browser.** Turnstile refused
to render in the tooling used during development and reported `110200` (hostname
not allowed) on four separate widgets, across both `pages.dev` and the custom
domain. Each failure was read as a configuration fault and produced a wrong
diagnosis — first that `pages.dev` was rejected as a shared domain, then that the
hostname list was wrong. Both were wrong: the widget renders and verifies
correctly in an ordinary browser. Test this layer in a real browser or not at all.

### Rate limiting

`withinRateLimit()` counts requests per `cf-connecting-ip` in a Workers KV
namespace bound as `BOOKING_RATE_LIMIT`, allowing 5 per 10 minutes and answering
429 beyond that.

It **fails open**, unlike every other check here. A throttle is a mitigation, not
a security boundary: if the counter store is unavailable, refusing every booking
would turn a storage blip into an outage, while the honeypot, size cap, length
limits and validation all still apply. The binding is optional for the same
reason — without it the endpoint runs unthrottled rather than refusing traffic.
Turnstile failed closed because it answers "is this a person", a question you
cannot skip.

Once an IP is over the limit no further writes happen, only a read, so a flood
cannot burn through the daily KV write allowance.

KV is used as a counter with a TTL, not as a store of application data. No
booking is written to it, which is why this does not cross the spec's
prohibition on adding a database.

### Residual risks, in order

1. **The throttle is best-effort, not a guarantee.** Workers KV has no atomic
   increment and is eventually consistent, so a simultaneous burst can slip a
   couple of requests past the limit. It stops sustained automated abuse, which
   is what this endpoint is exposed to; it is not an exact quota. A WAF rate
   limiting rule would be enforced before the request ever reached the Function,
   but WAF rules apply to zones you own and `pages.dev` is Cloudflare's zone.
2. **Turnstile cannot be checked by the monitor.** The uptime probe sends no
   token, so it can only confirm that verification *refuses* it — never that a
   genuine submission passes. That path is exercised only when a real person
   books, or by hand in a real browser.
3. **Resend quota.** Sustained abuse still exhausts the plan's daily send limit,
   after which genuine bookings fail. Rate limiting is the mitigation.
4. **No persistence.** If Resend rejects a message the inquiry is gone — there is
   no store to retry from. Accepted: the spec forbids a database in this phase.
   The Function does return a failure rather than a false success, so the sender
   knows to try again.
5. **Sandbox sender.** With `BOOKING_FROM_EMAIL` unset, delivery only reaches the
   Resend account owner. Changing `BOOKING_NOTIFICATION_EMAIL` to any other
   address fails silently — Resend accepts and drops. No code can detect this.
6. **Deploy token expires 6 December 2026.** Deploys start failing then; the live
   site is unaffected.

### Deliberately not done

- **CAPTCHA** — the spec rules out third-party interactive widgets, and it taxes
  every genuine promoter to stop bots a honeypot already catches.
- **A restrictive `script-src` CSP** — Next.js hydration uses inline scripts. A
  wrong value breaks the site in the browser, not at build time.
