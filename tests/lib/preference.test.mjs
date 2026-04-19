import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  defaults,
  parsePreference,
  formatPreference,
  resolvePreferencePath,
  readPreference,
  writePreference
} from "../../plugins/hyperscribe/scripts/lib/preference.mjs";

test("defaults: studio + light", () => {
  assert.deepEqual(defaults(), { theme: "studio", mode: "light" });
});

test("parsePreference: reads YAML frontmatter", () => {
  const src = `---\ntheme: void\nmode: dark\n---\n\n# body`;
  assert.deepEqual(parsePreference(src), { theme: "void", mode: "dark" });
});

test("parsePreference: missing frontmatter returns null", () => {
  assert.equal(parsePreference("no frontmatter here"), null);
});

test("parsePreference: extra fields preserved only for known keys", () => {
  const src = `---\ntheme: midnight\nmode: auto\nout_dir: ~/x\n---`;
  assert.deepEqual(parsePreference(src), { theme: "midnight", mode: "auto" });
});

test("parsePreference: trims whitespace around values", () => {
  const src = `---\ntheme:   gallery \nmode:  light  \n---`;
  assert.deepEqual(parsePreference(src), { theme: "gallery", mode: "light" });
});

test("formatPreference: produces canonical YAML + body", () => {
  const out = formatPreference({ theme: "void", mode: "dark" });
  assert.match(out, /^---\ntheme: void\nmode: dark\ncreated_at: /);
  assert.match(out, /# Hyperscribe preferences/);
  assert.match(out, /Valid values:/);
});

test("resolvePreferencePath: project-local wins over global", () => {
  const tmp = mkdtempSync(join(tmpdir(), "hs-pref-"));
  try {
    const local = join(tmp, ".hyperscribe");
    mkdirSync(local, { recursive: true });
    const localFile = join(local, "preference.md");
    writeFileSync(localFile, "---\ntheme: void\nmode: dark\n---");
    const globalFile = join(tmp, "_global_preference.md");
    writeFileSync(globalFile, "---\ntheme: studio\nmode: light\n---");
    const found = resolvePreferencePath({ cwd: tmp, homeFile: globalFile });
    assert.equal(found, localFile);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test("resolvePreferencePath: falls back to global when no project-local", () => {
  const tmp = mkdtempSync(join(tmpdir(), "hs-pref-"));
  try {
    const globalFile = join(tmp, "_global_preference.md");
    writeFileSync(globalFile, "---\ntheme: gallery\nmode: auto\n---");
    const found = resolvePreferencePath({ cwd: tmp, homeFile: globalFile });
    assert.equal(found, globalFile);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test("resolvePreferencePath: returns null when neither exists", () => {
  const tmp = mkdtempSync(join(tmpdir(), "hs-pref-"));
  try {
    const found = resolvePreferencePath({ cwd: tmp, homeFile: join(tmp, "nope.md") });
    assert.equal(found, null);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test("readPreference: returns parsed values or null", () => {
  const tmp = mkdtempSync(join(tmpdir(), "hs-pref-"));
  try {
    const p = join(tmp, "pref.md");
    writeFileSync(p, "---\ntheme: midnight\nmode: dark\n---\n");
    assert.deepEqual(readPreference(p), { theme: "midnight", mode: "dark" });
    assert.equal(readPreference(join(tmp, "nope.md")), null);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test("writePreference: creates parent dir and writes frontmatter", () => {
  const tmp = mkdtempSync(join(tmpdir(), "hs-pref-"));
  try {
    const target = join(tmp, "nested", "preference.md");
    writePreference(target, { theme: "void", mode: "light" });
    assert.ok(existsSync(target));
    const content = readFileSync(target, "utf8");
    assert.match(content, /theme: void/);
    assert.match(content, /mode: light/);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test("writePreference: throws on invalid theme", () => {
  const tmp = mkdtempSync(join(tmpdir(), "hs-pref-"));
  try {
    assert.throws(() => writePreference(join(tmp, "p.md"), { theme: "nope", mode: "light" }), /theme/i);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test("writePreference: throws on invalid mode", () => {
  const tmp = mkdtempSync(join(tmpdir(), "hs-pref-"));
  try {
    assert.throws(() => writePreference(join(tmp, "p.md"), { theme: "studio", mode: "rainy" }), /mode/i);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});
