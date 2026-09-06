import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  getAllReleases,
  getFeaturedReleases,
  getAllMixes,
  getFeaturedMixes,
  getUpcomingEvents,
  getPastEvents,
  getEventsByTimeframe,
  getAllGalleryImages,
  getPressAssets,
  getPressQuotes,
  getArtistProfile,
  getSiteConfig,
} from "@/lib/content";

const ASPECT_RATIOS = new Set(["16:9", "4:3", "1:1", "3:2", "4:5"]);

describe("content query layer", () => {
  test("featured releases are a subset of all releases, and all featured", () => {
    const all = getAllReleases();
    const featured = getFeaturedReleases();
    assert.ok(featured.length > 0);
    for (const release of featured) {
      assert.ok(all.includes(release));
      assert.equal(release.featured, true);
    }
  });

  test("featured mixes are a subset of all mixes, and all featured", () => {
    const all = getAllMixes();
    for (const mix of getFeaturedMixes()) {
      assert.ok(all.includes(mix));
      assert.equal(mix.featured, true);
    }
  });

  test("upcoming and past events partition the schedule", () => {
    const upcoming = getUpcomingEvents();
    const past = getPastEvents();
    assert.ok(upcoming.length > 0 && past.length > 0);
    for (const event of upcoming) assert.equal(event.timeframe, "upcoming");
    for (const event of past) assert.equal(event.timeframe, "past");
    assert.equal(
      new Set([...upcoming, ...past]).size,
      upcoming.length + past.length,
      "an event must not be both upcoming and past"
    );
  });

  test("getEventsByTimeframe agrees with the named helpers", () => {
    assert.deepEqual(getEventsByTimeframe("upcoming"), getUpcomingEvents());
    assert.deepEqual(getEventsByTimeframe("past"), getPastEvents());
  });

  test("ids are unique within each collection", () => {
    const collections = {
      releases: getAllReleases(),
      mixes: getAllMixes(),
      gallery: getAllGalleryImages(),
      pressAssets: getPressAssets(),
      pressQuotes: getPressQuotes(),
    };
    for (const [name, items] of Object.entries(collections)) {
      const ids = items.map((item: { id: string }) => item.id);
      assert.equal(new Set(ids).size, ids.length, `duplicate id in ${name}`);
    }
  });

  describe("gallery invariants", () => {
    test("every image declares a supported aspect ratio", () => {
      for (const image of getAllGalleryImages()) {
        assert.ok(ASPECT_RATIOS.has(image.aspectRatio), `${image.id}: ${image.aspectRatio}`);
      }
    });

    // Alt text is a WCAG 2.1 AA requirement named explicitly in PROJECT_SPEC.pdf.
    test("every image has non-trivial alt text", () => {
      for (const image of getAllGalleryImages()) {
        assert.ok(image.alt && image.alt.trim().length > 10, `${image.id} needs real alt text`);
      }
    });

    test("declared dimensions match the declared aspect ratio", () => {
      for (const image of getAllGalleryImages()) {
        const [w, h] = image.aspectRatio.split(":").map(Number);
        const expected = w / h;
        const actual = image.width / image.height;
        assert.ok(
          Math.abs(expected - actual) < 0.02,
          `${image.id}: ${image.width}x${image.height} is not ${image.aspectRatio}`
        );
      }
    });
  });

  test("press assets declare a url and a format", () => {
    for (const asset of getPressAssets()) {
      assert.ok(asset.fileUrl.startsWith("/"), `${asset.id} needs a root-relative url`);
      assert.ok(asset.fileFormat, `${asset.id} needs a format`);
    }
  });

  test("the artist profile exposes the fields the UI reads", () => {
    const artist = getArtistProfile();
    for (const field of [
      "name",
      "location",
      "status",
      "bookingAvailability",
      "genres",
      "socialLinks",
      "shortBio",
      "mediumBio",
      "longBio",
    ] as const) {
      assert.ok(artist[field] !== undefined, `artist profile is missing ${field}`);
    }
  });

  test("site navigation points at in-app routes", () => {
    for (const item of getSiteConfig().navItems) {
      assert.ok(item.href.startsWith("/"), `${item.href} should be root-relative`);
    }
  });
});
