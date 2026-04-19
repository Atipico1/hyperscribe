import { test } from "node:test";
import assert from "node:assert/strict";
import { Slide } from "../../plugins/hyperscribe/scripts/components/slide.mjs";

test("Slide: wraps with layout class", () => {
  const html = Slide({ layout: "title", title: "T" });
  assert.match(html, /<article class="hs-slide hs-slide-title"/);
});

test("Slide: title layout renders title + subtitle centered", () => {
  const html = Slide({ layout: "title", title: "Main Title", subtitle: "Subhead" });
  assert.match(html, /<h1 class="hs-slide-title-text">Main Title<\/h1>/);
  assert.match(html, /<p class="hs-slide-subtitle">Subhead<\/p>/);
});

test("Slide: content layout renders bullets", () => {
  const html = Slide({ layout: "content", title: "T", bullets: ["one", "two", "three"] });
  assert.match(html, /<h2 class="hs-slide-heading">T<\/h2>/);
  assert.match(html, /<ul class="hs-slide-bullets"><li>one<\/li><li>two<\/li><li>three<\/li><\/ul>/);
});

test("Slide: two-col layout splits bullets into two columns", () => {
  const html = Slide({ layout: "two-col", title: "T", bullets: ["a","b","c","d"] });
  assert.match(html, /<div class="hs-slide-col"><ul class="hs-slide-bullets"><li>a<\/li><li>b<\/li><\/ul><\/div>/);
  assert.match(html, /<div class="hs-slide-col"><ul class="hs-slide-bullets"><li>c<\/li><li>d<\/li><\/ul><\/div>/);
});

test("Slide: quote layout renders blockquote + attribution", () => {
  const html = Slide({ layout: "quote", quote: "Be kind.", subtitle: "— somebody" });
  assert.match(html, /<blockquote class="hs-slide-quote">Be kind\.<\/blockquote>/);
  assert.match(html, /<cite class="hs-slide-attrib">— somebody<\/cite>/);
});

test("Slide: image layout renders img + caption", () => {
  const html = Slide({ layout: "image", title: "Screenshot", image: "https://a.com/x.png", subtitle: "caption" });
  assert.match(html, /<h2 class="hs-slide-heading">Screenshot<\/h2>/);
  assert.match(html, /<img class="hs-slide-image" src="https:\/\/a\.com\/x\.png"[^>]*>/);
  assert.match(html, /<p class="hs-slide-caption">caption<\/p>/);
});

test("Slide: section layout renders huge title", () => {
  const html = Slide({ layout: "section", title: "Part II", subtitle: "The Fall" });
  assert.match(html, /<h1 class="hs-slide-section-title">Part II<\/h1>/);
});

test("Slide: escapes all text", () => {
  const html = Slide({ layout: "title", title: "<t>", subtitle: "<s>" });
  assert.match(html, /&lt;t&gt;/);
  assert.match(html, /&lt;s&gt;/);
});

test("Slide: escapes image src", () => {
  const html = Slide({ layout: "image", title: "T", image: "https://a.com/x.png?q=<bad>" });
  assert.match(html, /&lt;bad&gt;/);
});

test("Slide: bullets escape HTML", () => {
  const html = Slide({ layout: "content", title: "T", bullets: ["<x>"] });
  assert.match(html, /<li>&lt;x&gt;<\/li>/);
});
