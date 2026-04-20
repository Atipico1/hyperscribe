import { escape } from "./html.mjs";

const KEYWORDS = {
  js: new Set([
    "async", "await", "break", "case", "catch", "class", "const", "continue",
    "default", "delete", "else", "export", "extends", "false", "finally",
    "for", "from", "function", "if", "import", "in", "instanceof", "let",
    "new", "null", "return", "static", "super", "switch", "this", "throw",
    "true", "try", "typeof", "undefined", "var", "while", "yield"
  ]),
  ts: null,
  jsx: null,
  tsx: null,
  python: new Set([
    "and", "as", "await", "class", "def", "elif", "else", "except", "False",
    "finally", "for", "from", "if", "import", "in", "is", "None", "not",
    "or", "pass", "raise", "return", "True", "try", "while", "with", "yield"
  ]),
  py: null,
  json: new Set(["true", "false", "null"]),
  bash: new Set([
    "case", "do", "done", "echo", "elif", "else", "esac", "export", "fi",
    "for", "function", "if", "in", "local", "printf", "return", "then",
    "unset", "while"
  ]),
  sh: null,
  shell: null
};

KEYWORDS.ts = KEYWORDS.js;
KEYWORDS.jsx = KEYWORDS.js;
KEYWORDS.tsx = KEYWORDS.js;
KEYWORDS.py = KEYWORDS.python;
KEYWORDS.sh = KEYWORDS.bash;
KEYWORDS.shell = KEYWORDS.bash;

const COMMENT_MARKERS = {
  js: ["//"],
  ts: ["//"],
  jsx: ["//"],
  tsx: ["//"],
  python: ["#"],
  py: ["#"],
  bash: ["#"],
  sh: ["#"],
  shell: ["#"]
};

export function normalizeLang(lang) {
  return String(lang || "text").trim().toLowerCase() || "text";
}

export function languageLabel(lang) {
  const label = String(lang || "text").trim();
  return label || "text";
}

export function highlightCode(source, lang) {
  const normalized = normalizeLang(lang);
  return String(source ?? "")
    .split(/\r?\n/)
    .map((line) => highlightLine(line, normalized));
}

function highlightLine(line, lang) {
  const segments = [];
  let plain = "";
  let i = 0;

  const flushPlain = () => {
    if (!plain) return;
    segments.push(renderPlain(plain, lang));
    plain = "";
  };

  while (i < line.length) {
    const commentMarker = findCommentMarker(line, i, lang);
    if (commentMarker) {
      flushPlain();
      segments.push(wrap("comment", line.slice(i)));
      i = line.length;
      break;
    }

    const ch = line[i];
    if (ch === "'" || ch === '"' || ch === "`") {
      flushPlain();
      const { value, nextIndex } = readString(line, i, ch);
      segments.push(wrap("string", value));
      i = nextIndex;
      continue;
    }

    plain += ch;
    i += 1;
  }

  flushPlain();

  return segments.join("") || "&nbsp;";
}

function findCommentMarker(line, index, lang) {
  const markers = COMMENT_MARKERS[lang] || [];
  for (const marker of markers) {
    if (line.startsWith(marker, index)) return marker;
  }
  return null;
}

function readString(line, startIndex, quote) {
  let i = startIndex + 1;
  let escaped = false;
  while (i < line.length) {
    const ch = line[i];
    if (escaped) {
      escaped = false;
      i += 1;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      i += 1;
      continue;
    }
    if (ch === quote) {
      i += 1;
      break;
    }
    i += 1;
  }
  return { value: line.slice(startIndex, i), nextIndex: i };
}

function renderPlain(text, lang) {
  const keywords = KEYWORDS[lang];
  const pattern = /(\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g;
  let cursor = 0;
  let out = "";
  let match;
  while ((match = pattern.exec(text))) {
    const [token] = match;
    const start = match.index;
    if (start > cursor) out += escape(text.slice(cursor, start));
    if (/^\d/.test(token)) out += wrap("number", token);
    else if (keywords && keywords.has(token)) out += wrap("keyword", token);
    else out += escape(token);
    cursor = start + token.length;
  }
  if (cursor < text.length) out += escape(text.slice(cursor));
  return out;
}

function wrap(kind, value) {
  return `<span class="hs-code-token hs-code-token-${kind}">${escape(value)}</span>`;
}
