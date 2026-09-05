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
  - `Browser → Booking Form → BookingService abstraction → Cloudflare Pages Function (/functions/api/booking.ts) → Resend → DJ / Agent Email`
- **Configuration & Content**: Strongly typed local TypeScript modules designed to be easily replaced by a headless CMS or database in future phases without rewriting UI components.

---

## 2. Architecture Constraints

As specified in `PROJECT_SPEC.pdf`:
- **Static Export Only**: The Next.js application must remain statically exportable.
- **No Dynamic Server Backend**: No dynamic Next.js server runtime; no Next.js API routes that depend on runtime request data.
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

## 5. Environment Variables

For production booking notification dispatch via Cloudflare Pages Function:
- `BOOKING_NOTIFICATION_EMAIL`: Recipient email address for booking inquiries.
- `RESEND_API_KEY`: API credential for Resend transactional email delivery.

---

## 6. Development & Build Scripts

```bash
# Start local development server
npm run dev

# Compile static export to the /out directory
npm run build
```
