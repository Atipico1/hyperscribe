import { readFileSync, existsSync } from "node:fs";
import { extname } from "node:path";
import { escape, attr } from "../lib/html.mjs";

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function resolveSrc(src) {
  if (/^(https?:|data:)/i.test(src)) return src;
  const path = src.startsWith("file://") ? src.slice(7) : src;
  if (!existsSync(path)) throw new Error(`Image src not found: ${path}`);
  const mime = MIME[extname(path).toLowerCase()] || "application/octet-stream";
  const b64 = readFileSync(path).toString("base64");
  return `data:${mime};base64,${b64}`;
}

export function Image(props) {
  if (!props || !props.src) throw new Error("Image: 'src' is required");
  const src = resolveSrc(props.src);
  const altVal = props.alt || "";
  const w = props.width != null ? attr("width", Number(props.width)) : "";
  const h = props.height != null ? attr("height", Number(props.height)) : "";
  const caption = props.caption
    ? `<figcaption class="hs-image-caption">${escape(props.caption)}</figcaption>`
    : "";
  return `<figure class="hs-image"><img${attr("src", src)}${attr("alt", altVal)}${w}${h} loading="lazy"/>${caption}</figure>`;
}
