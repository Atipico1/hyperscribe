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

/**
 * Returns the light/dark mode toggle HTML + inline script.
 * Rendered in every page (theme is fixed at render time; mode is user-chosen).
 * Initial mode order: saved localStorage → prefers-color-scheme → "light".
 */
export function modeTogglerHtml() {
  return `<button type="button" class="hs-mode-toggler" id="hs-mode-toggler" aria-label="Toggle light/dark mode" title="Toggle light/dark mode">
  <svg class="hs-mode-icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
  <svg class="hs-mode-icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
</button>
<script>(function(){
  var KEY='hyperscribe.mode';
  var saved=null;try{saved=localStorage.getItem(KEY);}catch(e){}
  var mode = saved;
  if (!mode) {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    mode = prefersDark ? 'dark' : 'light';
  }
  function apply(m){
    document.documentElement.setAttribute('data-mode', m);
    try{localStorage.setItem(KEY, m);}catch(e){}
  }
  apply(mode);
  var btn=document.getElementById('hs-mode-toggler');
  if(btn){btn.addEventListener('click',function(){
    var next = document.documentElement.getAttribute('data-mode') === 'dark' ? 'light' : 'dark';
    apply(next);
  });}
})();</script>`;
}
