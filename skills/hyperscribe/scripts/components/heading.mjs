import { escape } from "../lib/html.mjs";

export function Heading(props) {
  const level = props.level;
  const id = props.anchor ? ` id="${escape(props.anchor)}"` : "";
  return `<h${level} class="hs-heading hs-heading-h${level}"${id}>${escape(props.text)}</h${level}>`;
}
