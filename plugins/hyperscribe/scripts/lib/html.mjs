const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

export function escape(str) {
  if (str == null) return "";
  return String(str).replace(/[&<>"']/g, c => ESCAPE_MAP[c]);
}

export function attr(key, value) {
  if (value === undefined || value === null || value === false) return "";
  if (value === true) return ` ${key}`;
  return ` ${key}="${escape(value)}"`;
}

export function tag(name, attrs = {}, children) {
  const attrStr = Object.entries(attrs).map(([k, v]) => attr(k, v)).join("");
  if (children === undefined) return `<${name}${attrStr}>`;
  return `<${name}${attrStr}>${children}</${name}>`;
}
