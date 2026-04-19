import { test } from "node:test";
import assert from "node:assert/strict";
import { SlideDeck } from "../../plugins/hyperscribe/scripts/components/slide-deck.mjs";

test("SlideDeck: wraps with aspect class", () => {
  const html = SlideDeck({ aspect: "16:9" }, () => "<slide>");
  assert.match(html, /<section class="hs-deck hs-deck-aspect-16-9"/);
});

test("SlideDeck: aspect 4:3 class", () => {
  const html = SlideDeck({ aspect: "4:3" }, () => "");
  assert.match(html, /hs-deck-aspect-4-3/);
});

test("SlideDeck: applies transition class when provided", () => {
  assert.match(SlideDeck({ aspect: "16:9", transition: "fade" }, () => ""), /hs-deck-transition-fade/);
  assert.match(SlideDeck({ aspect: "16:9", transition: "slide" }, () => ""), /hs-deck-transition-slide/);
  assert.doesNotMatch(SlideDeck({ aspect: "16:9", transition: "none" }, () => ""), /hs-deck-transition-/);
});

test("SlideDeck: includes children in slides container", () => {
  const html = SlideDeck({ aspect: "16:9" }, () => "<article>A</article><article>B</article>");
  assert.match(html, /<div class="hs-deck-slides"><article>A<\/article><article>B<\/article><\/div>/);
});

test("SlideDeck: includes navigation controls", () => {
  const html = SlideDeck({ aspect: "16:9" }, () => "");
  assert.match(html, /<nav class="hs-deck-nav">/);
  assert.match(html, /data-deck-action="prev"/);
  assert.match(html, /data-deck-action="next"/);
  assert.match(html, /class="hs-deck-counter"/);
});

test("SlideDeck: renders footer when provided", () => {
  const html = SlideDeck({ aspect: "16:9", footer: "© 2026" }, () => "");
  assert.match(html, /<footer class="hs-deck-footer">© 2026<\/footer>/);
});

test("SlideDeck: escapes footer", () => {
  const html = SlideDeck({ aspect: "16:9", footer: "<x>" }, () => "");
  assert.match(html, /&lt;x&gt;/);
});

test("SlideDeck: includes navigation JS with idempotent guard", () => {
  const html = SlideDeck({ aspect: "16:9" }, () => "");
  assert.match(html, /window\.__hsDeckLoaded/);
});
