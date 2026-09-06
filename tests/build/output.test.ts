import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
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
    const controls = [...page.matchAll(/<(input|select|textarea)\b[^>]*>/g)];
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
