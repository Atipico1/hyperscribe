import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const THEMES_DIR = resolve(__dirname, "..", "..", "themes");

export function listThemes() {
  if (!existsSync(THEMES_DIR)) return [];
  return readdirSync(THEMES_DIR)
    .filter(f => f.endsWith(".css"))
    .map(f => f.replace(/\.css$/, ""))
    .sort();
}

export function loadTheme(name) {
  const path = resolve(THEMES_DIR, `${name}.css`);
  if (!existsSync(path)) {
    throw new Error(`Unknown theme "${name}". Available: ${listThemes().join(", ")}`);
  }
  return readFileSync(path, "utf8");
}

export function themeSwitcherHtml(themes, defaultTheme) {
  if (themes.length < 2) return "";
  const options = themes.map(n => `<option value="${n}"${n === defaultTheme ? " selected" : ""}>${n}</option>`).join("");
  return `<div class="hs-theme-switcher" aria-label="Theme"><select id="hs-theme-select">${options}</select></div>
<script>(function(){
  var KEY='hyperscribe.theme';
  var saved=null;try{saved=localStorage.getItem(KEY);}catch(e){}
  var fallback='${defaultTheme}';
  var initial = saved || fallback;
  document.documentElement.setAttribute('data-theme', initial);
  var sel=document.getElementById('hs-theme-select');
  if(sel){sel.value=initial;sel.addEventListener('change',function(){
    document.documentElement.setAttribute('data-theme', sel.value);
    try{localStorage.setItem(KEY, sel.value);}catch(e){}
  });}
})();</script>`;
}
