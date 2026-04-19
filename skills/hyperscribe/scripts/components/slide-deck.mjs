import { escape } from "../lib/html.mjs";

const DECK_JS = `
if (!window.__hsDeckLoaded) {
  window.__hsDeckLoaded = true;
  document.addEventListener('DOMContentLoaded', function() { setup(); });
  if (document.readyState !== 'loading') setup();

  function setup() {
    document.querySelectorAll('.hs-deck').forEach(deck => {
      if (deck.__hsInit) return;
      deck.__hsInit = true;
      const slides = Array.from(deck.querySelectorAll('.hs-slide'));
      const counter = deck.querySelector('.hs-deck-counter');
      let i = 0;
      function show(n) {
        i = Math.max(0, Math.min(slides.length - 1, n));
        slides.forEach((s, idx) => s.classList.toggle('hs-slide-active', idx === i));
        if (counter) counter.textContent = (i + 1) + ' / ' + slides.length;
      }
      deck.addEventListener('click', e => {
        const btn = e.target.closest('[data-deck-action]');
        if (!btn) return;
        const action = btn.dataset.deckAction;
        if (action === 'prev') show(i - 1);
        else if (action === 'next') show(i + 1);
        else if (action === 'first') show(0);
        else if (action === 'last') show(slides.length - 1);
      });
      deck.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { show(i - 1); e.preventDefault(); }
        else if (e.key === 'ArrowRight' || e.key === ' ') { show(i + 1); e.preventDefault(); }
        else if (e.key === 'Home') { show(0); e.preventDefault(); }
        else if (e.key === 'End') { show(slides.length - 1); e.preventDefault(); }
      });
      deck.setAttribute('tabindex', '0');
      show(0);
    });
  }
}
`.trim();

export function SlideDeck(props, renderChildren) {
  const aspect = props.aspect.replace(":", "-");
  const transitionClass = props.transition && props.transition !== "none"
    ? ` hs-deck-transition-${props.transition}`
    : "";
  const footer = props.footer
    ? `<footer class="hs-deck-footer">${escape(props.footer)}</footer>`
    : "";
  const children = renderChildren();
  return `<section class="hs-deck hs-deck-aspect-${aspect}${transitionClass}"><div class="hs-deck-slides">${children}</div><nav class="hs-deck-nav"><button type="button" data-deck-action="first">⏮</button><button type="button" data-deck-action="prev">◀</button><span class="hs-deck-counter">1 / ?</span><button type="button" data-deck-action="next">▶</button><button type="button" data-deck-action="last">⏭</button></nav>${footer}<script>${DECK_JS}</script></section>`;
}
