import { escape } from "../lib/html.mjs";

export function Page(props, renderChildren, ctx = {}) {
  const title = escape(props.title);
  const subtitle = props.subtitle
    ? `<p class="hs-page-subtitle">${escape(props.subtitle)}</p>`
    : "";
  const header = `<header class="hs-page-header"><h1 class="hs-page-title">${title}</h1>${subtitle}</header>`;
  const main = `<main class="hs-page-main">${renderChildren()}</main>`;
  return `<article class="hs-page">${header}${main}</article>`;
}
