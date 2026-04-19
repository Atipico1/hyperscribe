/* Hyperscribe interactive layer — pan/zoom for SVG diagrams.
 * Any element tagged `.hs-zoomable` gets: mouse-drag pan, Ctrl/Cmd+wheel zoom,
 * and a small control bar (＋ / − / ⟲ reset) docked to the top-right corner. */
(function () {
  function initZoom(container) {
    if (container.dataset.hsZoomInit) return;
    container.dataset.hsZoomInit = "1";

    // Move existing children into a transform stage.
    var stage = document.createElement("div");
    stage.className = "hs-zoom-stage";
    while (container.firstChild) stage.appendChild(container.firstChild);
    container.appendChild(stage);

    // Controls
    var controls = document.createElement("div");
    controls.className = "hs-zoom-controls";
    controls.innerHTML =
      '<button type="button" class="hs-zoom-btn" data-zoom="in"    aria-label="Zoom in"    title="Zoom in (Ctrl/Cmd + wheel)">＋</button>' +
      '<button type="button" class="hs-zoom-btn" data-zoom="out"   aria-label="Zoom out"   title="Zoom out">−</button>' +
      '<button type="button" class="hs-zoom-btn" data-zoom="reset" aria-label="Reset zoom" title="Reset">⟲</button>';
    container.appendChild(controls);

    var scale = 1, tx = 0, ty = 0;
    var MIN = 0.2, MAX = 5;

    function apply() {
      stage.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
    }
    function clamp(s) { return Math.max(MIN, Math.min(MAX, s)); }
    function zoomAt(newScale, cx, cy) {
      var ns = clamp(newScale);
      if (ns === scale) return;
      var r = ns / scale;
      tx = cx - (cx - tx) * r;
      ty = cy - (cy - ty) * r;
      scale = ns;
      apply();
    }
    function reset() { scale = 1; tx = 0; ty = 0; apply(); }
    function center() {
      return { cx: container.clientWidth / 2, cy: container.clientHeight / 2 };
    }

    controls.addEventListener("click", function (e) {
      var btn = e.target.closest(".hs-zoom-btn");
      if (!btn) return;
      var op = btn.getAttribute("data-zoom");
      var c = center();
      if (op === "in") zoomAt(scale * 1.25, c.cx, c.cy);
      else if (op === "out") zoomAt(scale / 1.25, c.cx, c.cy);
      else reset();
    });

    container.addEventListener("wheel", function (e) {
      // Only hijack wheel when Ctrl/Cmd is held — otherwise let the page scroll.
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      var rect = container.getBoundingClientRect();
      var cx = e.clientX - rect.left;
      var cy = e.clientY - rect.top;
      var factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      zoomAt(scale * factor, cx, cy);
    }, { passive: false });

    // Drag to pan
    var dragging = false, lastX = 0, lastY = 0, activePointer = null;
    stage.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      if (e.target.closest(".hs-zoom-controls")) return;
      dragging = true;
      lastX = e.clientX; lastY = e.clientY; activePointer = e.pointerId;
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging || e.pointerId !== activePointer) return;
      tx += e.clientX - lastX;
      ty += e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      apply();
    });
    function endDrag(e) {
      if (e && e.pointerId !== activePointer) return;
      dragging = false;
      activePointer = null;
      try { stage.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("pointerleave", function () { dragging = false; });
  }

  function initAll(root) {
    (root || document).querySelectorAll(".hs-zoomable").forEach(initZoom);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { initAll(); });
  } else {
    initAll();
  }

  // Expose for content injected after load (e.g. Mermaid-rendered SVG).
  window.__hsInitZoom = initAll;
})();
