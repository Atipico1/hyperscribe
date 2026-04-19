import { escape } from "../lib/html.mjs";

function cellClass(col) {
  return col.align ? `hs-td-${col.align}` : "";
}

function renderCell(row, col) {
  const v = row[col.key];
  if (v === undefined || v === null) return `<td${col.align ? ` class="${cellClass(col)}"` : ""}></td>`;
  const content = typeof v === "number" ? String(v) : escape(v);
  const cls = col.align ? ` class="${cellClass(col)}"` : "";
  return `<td${cls}>${content}</td>`;
}

function renderTh(col) {
  const cls = col.align ? ` class="${cellClass(col)}"` : "";
  return `<th${cls}>${escape(col.label)}</th>`;
}

export function DataTable(props) {
  const density = props.density || "standard";
  const caption = props.caption ? `<caption>${escape(props.caption)}</caption>` : "";
  const thead = `<thead><tr>${props.columns.map(renderTh).join("")}</tr></thead>`;
  const tbody = `<tbody>${props.rows.map(r => `<tr>${props.columns.map(c => renderCell(r, c)).join("")}</tr>`).join("")}</tbody>`;
  const tfoot = props.footer
    ? `<tfoot><tr>${props.columns.map(c => renderCell(props.footer, c)).join("")}</tr></tfoot>`
    : "";
  return `<table class="hs-table hs-table-${density}">${caption}${thead}${tbody}${tfoot}</table>`;
}
