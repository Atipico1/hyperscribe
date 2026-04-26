import { test } from "node:test";
import assert from "node:assert/strict";

import {
  GALLERY_COMPONENTS,
  README_GALLERY_COUNT,
  README_GALLERY_COMPONENTS,
  buildReadmeGallerySection
} from "../tools/component-gallery.mjs";

test("component gallery: includes the 23 default page-mode components", () => {
  assert.equal(GALLERY_COMPONENTS.length, 23);
  assert.equal(
    GALLERY_COMPONENTS.some((entry) => entry.component === "hyperscribe/SlideDeck"),
    false
  );
  assert.equal(
    GALLERY_COMPONENTS.some((entry) => entry.component === "hyperscribe/Slide"),
    false
  );
});

test("component gallery: README gallery excludes the 4 text-only components", () => {
  assert.equal(README_GALLERY_COMPONENTS.length, 19);
  assert.equal(README_GALLERY_COUNT, 19);
  for (const name of [
    "hyperscribe/Page",
    "hyperscribe/Section",
    "hyperscribe/Heading",
    "hyperscribe/Prose"
  ]) {
    assert.equal(
      README_GALLERY_COMPONENTS.some((entry) => entry.component === name),
      false
    );
  }
});

test("component gallery: renders README section with image links for every component", () => {
  const section = buildReadmeGallerySection(README_GALLERY_COMPONENTS.slice(0, 4));

  assert.match(section, /## Components Gallery/);
  assert.match(section, /<table>/);
  assert.match(section, /Visual previews for 19 non-text page-mode components\./);
  assert.match(section, /assets\/component-gallery\/image\.webp/);
  assert.match(section, /assets\/component-gallery\/callout\.webp/);
  assert.match(section, /assets\/component-gallery\/kpi-card\.webp/);
  assert.match(section, /assets\/component-gallery\/code-block\.webp/);
});
