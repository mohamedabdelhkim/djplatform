import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import {
  getAllGalleryImages,
  getAllReleases,
  getAllMixes,
  getPressAssets,
} from "@/lib/content";

// These assertions run against the real static export, because the defects this
// project has actually shipped were invisible to `tsc` and to `next build`:
// images pinned to one aspect ratio, form controls with no label, a component
// silently dropped from a page. Only the emitted HTML shows them.

const OUT = path.join(process.cwd(), "out");
const PAGES = ["index", "music", "events", "press", "_not-found"];
const html: Record<string, string> = {};

before(() => {
  assert.ok(
    existsSync(OUT),
    "out/ is missing - run `npm run build` before the build tests (`npm test` does this for you)"
  );
  for (const page of PAGES) {
    const file = path.join(OUT, `${page}.html`);
    assert.ok(existsSync(file), `out/${page}.html was not generated`);
    html[page] = readFileSync(file, "utf8");
  }
});

describe("static export shape", () => {
  test("no server route leaked into the export", () => {
    assert.ok(
      !existsSync(path.join(OUT, "api")),
      "out/api exists - a Next.js API route is back, which the spec forbids"
    );
  });

  test("every page has a title", () => {
    for (const page of PAGES) {
      assert.match(html[page], /<title>[^<]+<\/title>/, `${page}.html has no title`);
    }
  });
});

describe("booking form accessibility", () => {
  // PROJECT_SPEC.pdf requires WCAG 2.1 AA with "correct labels".
  // A placeholder is not a label.
  test("every form control is associated with a label element", () => {
    const page = html.index;
    // aria-hidden controls are excluded: the honeypot is deliberately hidden
    // from assistive technology and is not a control a person can reach, so a
    // label on it would be wrong rather than missing.
    const controls = [...page.matchAll(/<(input|select|textarea)\b[^>]*>/g)].filter(
      ([tag]) => !/aria-hidden="true"/.test(tag)
    );
    assert.ok(controls.length >= 9, `expected the full booking form, found ${controls.length} controls`);

    const labelled = new Set([...page.matchAll(/<label[^>]*\bfor="([^"]+)"/g)].map((m) => m[1]));

    for (const [tag] of controls) {
      const id = /\bid="([^"]+)"/.exec(tag)?.[1];
      assert.ok(id, `a form control has no id: ${tag.slice(0, 90)}`);
      assert.ok(labelled.has(id), `no <label for="${id}"> in the built page`);
    }
  });

  // A live region has to be in the DOM before the message is inserted,
  // otherwise screen readers are not observing it and miss the announcement.
  test("the submission status live region is present at build time", () => {
    assert.match(
      html.index,
      /role="status"[^>]*aria-live="polite"|aria-live="polite"[^>]*role="status"/,
      "the booking status live region is not mounted in the static HTML"
    );
  });
});

describe("gallery rendering", () => {
  const RATIO_CLASS: Record<string, string> = {
    "16:9": "aspect-[16/9]",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
    "3:2": "aspect-[3/2]",
    "4:5": "aspect-[4/5]",
  };

  // Regression guard: the gallery once hardcoded aspect-[4/3] for every image
  // while the config declared five different ratios.
  test("each declared aspect ratio reaches the built page", () => {
    const declared = new Set(getAllGalleryImages().map((image) => image.aspectRatio));
    assert.ok(declared.size > 1, "fixture should cover more than one ratio");

    for (const ratio of declared) {
      assert.ok(
        html.index.includes(RATIO_CLASS[ratio]),
        `no element uses ${RATIO_CLASS[ratio]} for declared ratio ${ratio}`
      );
    }
  });

  test("every gallery image src appears in the page", () => {
    for (const image of getAllGalleryImages()) {
      assert.ok(html.index.includes(image.src), `${image.src} is not rendered`);
    }
  });
});

describe("referenced assets exist in the export", () => {
  const referenced = [
    ...getAllGalleryImages().map((i) => i.src),
    ...getAllReleases().map((r) => r.artwork),
    ...getAllMixes().map((m) => m.artwork),
    ...getPressAssets().map((a) => a.fileUrl),
  ];

  test("the fixture references assets at all", () => {
    assert.ok(referenced.length >= 18, `expected the full asset manifest, got ${referenced.length}`);
  });

  for (const ref of referenced) {
    test(`${ref} is present in out/`, () => {
      assert.ok(existsSync(path.join(OUT, ref.replace(/^\//, ""))), `${ref} is referenced but missing`);
    });
  }
});

describe("abuse hardening", () => {
  test("the honeypot is rendered, hidden, and unreachable", () => {
    const field = /<input[^>]*\bname="contact_reference"[^>]*>/.exec(html.index)?.[0];
    assert.ok(field, "the honeypot input is missing from the built page");
    assert.match(field, /aria-hidden="true"/, "the honeypot must be hidden from screen readers");
    assert.match(field, /tabindex="-1"/i, "the honeypot must be out of the tab order");
    assert.match(field, /autocomplete="off"/i, "the honeypot must not be autofilled");
    assert.ok(
      /left-\[-9999px\]|opacity-0/.test(field),
      "the honeypot must be visually hidden"
    );
  });

  test("the honeypot is not announced as a labelled field", () => {
    const labelled = new Set(
      [...html.index.matchAll(/<label[^>]*\bfor="([^"]+)"/g)].map((m) => m[1])
    );
    assert.ok(!labelled.has("contact_reference"), "the honeypot must not have a visible label");
  });

  test("security headers ship with the export", () => {
    const headersFile = path.join(OUT, "_headers");
    assert.ok(existsSync(headersFile), "out/_headers is missing - Cloudflare will send no security headers");
    const contents = readFileSync(headersFile, "utf8");
    for (const header of [
      "X-Frame-Options",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "Content-Security-Policy",
    ]) {
      assert.match(contents, new RegExp(header, "i"), `${header} is not declared`);
    }
  });

  // A script-src or default-src directive would break Next.js hydration, and it
  // would break it in the browser at runtime rather than at build time.
  test("the CSP stays clear of directives that break hydration", () => {
    const contents = readFileSync(path.join(OUT, "_headers"), "utf8");
    const csp = /Content-Security-Policy:(.*)/i.exec(contents)?.[1] ?? "";
    assert.ok(!/script-src|default-src/i.test(csp), "CSP must not restrict scripts here");
    assert.match(csp, /frame-ancestors/i);
  });
});

describe("Turnstile", () => {
  test("the widget container ships with the page", () => {
    const widget = /<div[^>]*class="cf-turnstile"[^>]*>/.exec(html.index)?.[0];
    assert.ok(widget, "the Turnstile widget container is missing from the built page");
    // Site keys contain characters beyond [A-Za-z0-9] - underscores among them.
    assert.match(widget, /data-sitekey="0x[\w-]+"/, "the widget has no site key");
  });

  test("the challenge script is referenced", () => {
    assert.match(
      html.index,
      /challenges\.cloudflare\.com\/turnstile\/v0\/api\.js/,
      "the Turnstile script is not loaded"
    );
  });

  // The CSP has no script-src or frame-src, so the widget's script and iframe
  // are allowed. Adding either directive later without listing
  // challenges.cloudflare.com would break the booking form in the browser only.
  test("the CSP does not block the challenge", () => {
    const csp = /Content-Security-Policy:(.*)/i.exec(
      readFileSync(path.join(OUT, "_headers"), "utf8")
    )?.[1] ?? "";
    assert.ok(!/script-src|frame-src|default-src/i.test(csp));
  });
});

describe("asset budget", () => {
  // Nothing in this stack will save a heavy image. `output: "export"` forces
  // images.unoptimized, so next/image emits a plain <img> and ships exactly the
  // file it was handed: no resizing, no re-encoding, no WebP conversion. The
  // free Cloudflare plan has no automatic image optimisation either.
  //
  // The failure is invisible where it would be noticed. A gallery of camera
  // JPEGs is thirty megabytes, but on a laptop with a warm cache it still feels
  // instant, so it passes review and reaches a promoter on a phone as a blank
  // screen. Compressed properly the same gallery is under a megabyte - a
  // difference of roughly fifty times, decided entirely by what gets committed.
  //
  // To exceed a limit on purpose, add the path to BUDGET_EXCEPTIONS with a
  // reason. The point is to make the choice deliberate, not impossible.

  const MAX_IMAGE_BYTES = 200 * 1024;
  const MAX_IMAGE_TOTAL_BYTES = 1_500 * 1024;
  const MAX_DOWNLOAD_BYTES = 10 * 1024 * 1024;

  // WebP and AVIF carry the same picture in a fraction of the bytes, and here
  // that saving has to come from the file itself. SVG and ICO are size-capped
  // rather than banned: a vector is usually tiny, but an SVG with a base64
  // raster inside it is not a vector in any way that matters.
  const ALLOWED_IMAGE = new Set([".webp", ".avif", ".svg", ".ico"]);

  // Next emits generated metadata images with no file extension at all
  // (out/opengraph-image, out/apple-icon), so an extension-based scan walks
  // straight past them. They are exempt from the format rule on purpose - Apple
  // and every Open Graph consumer want PNG, and WebP would simply not render -
  // but they are emphatically not exempt from the weight limits: a redesign that
  // drops a photograph into the share card would otherwise ship unmeasured.
  const EXTENSIONLESS_IMAGES = new Set(["opengraph-image", "apple-icon"]);
  const LEGACY_IMAGE = new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tif", ".tiff"]);
  const DOWNLOAD = new Set([".pdf", ".zip"]);

  const BUDGET_EXCEPTIONS: readonly string[] = [
    // "images/gallery/hero.webp", // full-bleed hero, 320KB is deliberate
  ];

  function walk(dir: string, prefix = ""): { path: string; bytes: number }[] {
    const found: { path: string; bytes: number }[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) found.push(...walk(full, rel));
      else found.push({ path: rel, bytes: statSync(full).size });
    }
    return found;
  }

  const shipped = walk(OUT).filter((f) => !BUDGET_EXCEPTIONS.includes(f.path));
  const ext = (p: string) => path.extname(p).toLowerCase();
  const kb = (bytes: number) => `${Math.round(bytes / 1024)}KB`;

  const images = shipped.filter(
    (f) =>
      ALLOWED_IMAGE.has(ext(f.path)) ||
      LEGACY_IMAGE.has(ext(f.path)) ||
      EXTENSIONLESS_IMAGES.has(f.path)
  );

  test("no image ships in a legacy format", () => {
    const legacy = shipped.filter((f) => LEGACY_IMAGE.has(ext(f.path)));
    assert.deepEqual(
      legacy.map((f) => f.path),
      [],
      `convert these to .webp or .avif before committing them (https://squoosh.app):\n` +
        legacy.map((f) => `  ${f.path} (${kb(f.bytes)})`).join("\n")
    );
  });

  test(`no single image exceeds ${kb(MAX_IMAGE_BYTES)}`, () => {
    const heavy = images.filter((f) => f.bytes > MAX_IMAGE_BYTES);
    assert.deepEqual(
      heavy.map((f) => f.path),
      [],
      `re-export these smaller - 1920px wide is enough, and quality 75 is usually indistinguishable:\n` +
        heavy.map((f) => `  ${f.path} is ${kb(f.bytes)}, limit is ${kb(MAX_IMAGE_BYTES)}`).join("\n")
    );
  });

  test(`all images together stay under ${kb(MAX_IMAGE_TOTAL_BYTES)}`, () => {
    // Twenty images just inside the per-file limit are still four megabytes.
    const total = images.reduce((sum, f) => sum + f.bytes, 0);
    assert.ok(
      total <= MAX_IMAGE_TOTAL_BYTES,
      `images total ${kb(total)} across ${images.length} files, limit is ${kb(MAX_IMAGE_TOTAL_BYTES)}`
    );
  });

  test(`no download exceeds ${Math.round(MAX_DOWNLOAD_BYTES / 1024 / 1024)}MB`, () => {
    // Press packs are an explicit click, so the ceiling is far higher than for
    // images - but a rider PDF with uncompressed scans in it still has no excuse.
    const heavy = shipped.filter((f) => DOWNLOAD.has(ext(f.path)) && f.bytes > MAX_DOWNLOAD_BYTES);
    assert.deepEqual(
      heavy.map((f) => f.path),
      [],
      heavy.map((f) => `  ${f.path} is ${kb(f.bytes)}`).join("\n")
    );
  });

  test("the budget is actually looking at the export", () => {
    // Without this, an empty or mis-rooted walk would let every check above pass
    // by finding nothing - the quietest way for a guard to stop guarding.
    assert.ok(shipped.length > 20, `only ${shipped.length} files found under out/`);
    assert.ok(images.length >= 13, `only ${images.length} images found - the asset manifest should be larger`);

    // The share card is the one image most likely to be redesigned by someone
    // who never sees this file, so assert it is actually inside the budget
    // rather than trusting that the scan happened to pick it up.
    for (const name of EXTENSIONLESS_IMAGES) {
      assert.ok(
        images.some((f) => f.path === name),
        `${name} is not being measured - Next stopped emitting it, or renamed it`
      );
    }
  });
});
