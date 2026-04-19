import { escape } from "./html.mjs";

export function renderMarkdown(md) {
  if (!md || !md.trim()) return "";
  const blocks = splitBlocks(md);
  return blocks.map(renderBlock).join("\n");
}

function splitBlocks(md) {
  const lines = md.split("\n");
  const blocks = [];
  let current = [];
  let currentType = null;

  function flush() {
    if (current.length === 0) return;
    blocks.push({ type: currentType, lines: current });
    current = [];
    currentType = null;
  }

  for (const line of lines) {
    if (line.trim() === "") {
      flush();
      continue;
    }
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    const type = ul ? "ul" : ol ? "ol" : "p";
    if (currentType && currentType !== type) flush();
    currentType = type;
    current.push(type === "p" ? line : (ul ? ul[1] : ol[1]));
  }
  flush();
  return blocks;
}

function renderBlock(block) {
  if (block.type === "p") {
    return `<p>${renderInline(block.lines.join(" "))}</p>`;
  }
  const items = block.lines.map(l => `<li>${renderInline(l)}</li>`).join("");
  return `<${block.type}>${items}</${block.type}>`;
}

function renderInline(text) {
  const placeholders = [];
  let s = text;

  s = s.replace(/`([^`]+)`/g, (_, code) => {
    placeholders.push(`<code>${escape(code)}</code>`);
    return `\u0000${placeholders.length - 1}\u0000`;
  });

  s = s.replace(/\[([^\]]+)\]\((.+?)\)(?!\))/g, (_, label, href) => {
    placeholders.push(`<a href="${escape(href)}">${escape(label)}</a>`);
    return `\u0000${placeholders.length - 1}\u0000`;
  });

  s = escape(s);

  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/(^|[^_])_([^_]+)_/g, "$1<em>$2</em>");

  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => placeholders[Number(i)]);

  return s;
}
