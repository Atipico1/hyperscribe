#!/usr/bin/env node

import { readFileSync, statSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const BENCH_DIR = resolve(ROOT, "benchmark");

const artifacts = [
  {
    key: "visualExplainer",
    label: "visual-explainer",
    artifactPath: resolve(BENCH_DIR, "visual-explainer.html"),
    notesPath: resolve(BENCH_DIR, "visual-explainer-notes.md")
  },
  {
    key: "hyperscribe",
    label: "Hyperscribe",
    artifactPath: resolve(BENCH_DIR, "hyperscribe.json"),
    notesPath: resolve(BENCH_DIR, "hyperscribe-notes.md")
  }
];

const inputPath = existsSync(resolve(ROOT, "benchmark", "context.md"))
  ? resolve(ROOT, "benchmark", "context.md")
  : resolve(ROOT, "context.md");

const tokenScript = `
from pathlib import Path
import json
import sys
import tiktoken

enc = tiktoken.get_encoding("o200k_base")
payload = {
  "input_tokens": len(enc.encode(Path(sys.argv[1]).read_text())),
  "artifact_tokens": len(enc.encode(Path(sys.argv[2]).read_text()))
}
print(json.dumps(payload))
`;

function countTokens(artifactPath) {
  const result = spawnSync("uv", ["run", "--quiet", "--with", "tiktoken", "python3", "-c", tokenScript, inputPath, artifactPath], {
    cwd: ROOT,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "token counting failed");
  }

  return JSON.parse(result.stdout.trim());
}

function loadResults() {
  return artifacts.map((artifact) => {
    const stats = statSync(artifact.artifactPath);
    const tokens = countTokens(artifact.artifactPath);
    const notes = readFileSync(artifact.notesPath, "utf8").trim();
    return {
      ...artifact,
      bytes: stats.size,
      ...tokens,
      notes
    };
  });
}

console.log(JSON.stringify(loadResults(), null, 2));
