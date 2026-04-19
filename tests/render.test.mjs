import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, basename } from "node:path";
import { render } from "../plugins/hyperscribe/scripts/render.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = resolve(__dirname, "fixtures");
const GOLDEN = resolve(__dirname, "golden");

mkdirSync(GOLDEN, { recursive: true });

const fixtures = readdirSync(FIXTURES).filter(f => f.endsWith(".json"));

for (const fx of fixtures) {
  test(`golden: ${fx}`, async () => {
    const doc = JSON.parse(readFileSync(join(FIXTURES, fx), "utf8"));
    const html = await render(doc);
    const goldenPath = join(GOLDEN, fx.replace(/\.json$/, ".html"));

    if (process.env.UPDATE_GOLDEN === "1" || !existsSync(goldenPath)) {
      writeFileSync(goldenPath, html, "utf8");
      console.log(`wrote golden: ${basename(goldenPath)}`);
      return;
    }

    const expected = readFileSync(goldenPath, "utf8");
    assert.equal(html, expected, `golden mismatch for ${fx} — run UPDATE_GOLDEN=1 npm test to accept`);
  });
}
