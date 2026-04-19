import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";

const VALID_THEMES = new Set(["studio", "midnight", "void", "gallery"]);
const VALID_MODES  = new Set(["light", "dark", "auto"]);

export function defaults() {
  return { theme: "studio", mode: "light" };
}

export function parsePreference(src) {
  if (typeof src !== "string") return null;
  const m = src.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return null;
  const body = m[1];
  const out = {};
  for (const line of body.split(/\r?\n/)) {
    const kv = line.match(/^\s*([a-z_][a-z0-9_]*)\s*:\s*(.*?)\s*$/i);
    if (!kv) continue;
    const key = kv[1];
    const val = kv[2];
    if (key === "theme" || key === "mode") out[key] = val;
  }
  if (!out.theme && !out.mode) return null;
  return {
    theme: out.theme ?? defaults().theme,
    mode:  out.mode  ?? defaults().mode
  };
}

export function formatPreference({ theme, mode }) {
  const created = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  return `---
theme: ${theme}
mode: ${mode}
created_at: ${created}
---

# Hyperscribe preferences

Edit the values above to change your defaults. Delete this file to re-run
the first-run setup on the next hyperscribe invocation.

Valid values:
  theme: studio | midnight | void | gallery
  mode:  light | dark | auto
`;
}

export function resolvePreferencePath({ cwd = process.cwd(), homeFile } = {}) {
  const local = resolve(cwd, ".hyperscribe", "preference.md");
  if (existsSync(local)) return local;
  const globalPath = homeFile ?? join(homedir(), ".hyperscribe", "preference.md");
  if (existsSync(globalPath)) return globalPath;
  return null;
}

export function readPreference(path) {
  if (!path || !existsSync(path)) return null;
  const src = readFileSync(path, "utf8");
  return parsePreference(src);
}

export function writePreference(path, { theme, mode }) {
  if (!VALID_THEMES.has(theme)) {
    throw new Error(`Invalid theme "${theme}". Allowed: ${[...VALID_THEMES].join("|")}`);
  }
  if (!VALID_MODES.has(mode)) {
    throw new Error(`Invalid mode "${mode}". Allowed: ${[...VALID_MODES].join("|")}`);
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, formatPreference({ theme, mode }), "utf8");
}
