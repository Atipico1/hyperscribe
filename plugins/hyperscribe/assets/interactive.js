/* Hyperscribe interactive layer — pan/zoom for SVG diagrams.
 * Any element tagged `.hs-zoomable` gets: mouse-drag pan, Ctrl/Cmd+wheel zoom,
 * and a small control bar (＋ / − / ⟲ reset) docked to the top-right corner. */
(function () {
  function initZoom(container) {
    if (container.dataset.hsZoomInit) return;
    container.dataset.hsZoomInit = "1";

    var stage = document.createElement("div");
    stage.className = "hs-zoom-stage";
    while (container.firstChild) stage.appendChild(container.firstChild);
    container.appendChild(stage);

    var controls = document.createElement("div");
    controls.className = "hs-zoom-controls";
    controls.innerHTML =
      '<button type="button" class="hs-zoom-btn" data-zoom="in" aria-label="Zoom in" title="Zoom in (Ctrl/Cmd + wheel)">＋</button>' +
      '<button type="button" class="hs-zoom-btn" data-zoom="out" aria-label="Zoom out" title="Zoom out">−</button>' +
      '<button type="button" class="hs-zoom-btn" data-zoom="reset" aria-label="Reset zoom" title="Reset">⟲</button>';
    container.appendChild(controls);

    var scale = 1;
    var tx = 0;
    var ty = 0;
    var MIN = 0.2;
    var MAX = 5;

    function apply() {
      stage.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
    }

    function clampScale(next) {
      return Math.max(MIN, Math.min(MAX, next));
    }

    function zoomAt(newScale, cx, cy) {
      var next = clampScale(newScale);
      if (next === scale) return;
      var ratio = next / scale;
      tx = cx - (cx - tx) * ratio;
      ty = cy - (cy - ty) * ratio;
      scale = next;
      apply();
    }

    function reset() {
      scale = 1;
      tx = 0;
      ty = 0;
      apply();
    }

    function center() {
      return { cx: container.clientWidth / 2, cy: container.clientHeight / 2 };
    }

    controls.addEventListener("click", function (event) {
      var btn = event.target.closest(".hs-zoom-btn");
      if (!btn) return;
      var op = btn.getAttribute("data-zoom");
      var c = center();
      if (op === "in") zoomAt(scale * 1.25, c.cx, c.cy);
      else if (op === "out") zoomAt(scale / 1.25, c.cx, c.cy);
      else reset();
    });

    container.addEventListener("wheel", function (event) {
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      var rect = container.getBoundingClientRect();
      var cx = event.clientX - rect.left;
      var cy = event.clientY - rect.top;
      var factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
      zoomAt(scale * factor, cx, cy);
    }, { passive: false });

    var dragging = false;
    var lastX = 0;
    var lastY = 0;
    var activePointer = null;

    stage.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) return;
      if (event.target.closest(".hs-zoom-controls")) return;
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      activePointer = event.pointerId;
      try { stage.setPointerCapture(event.pointerId); } catch (_) {}
    });

    stage.addEventListener("pointermove", function (event) {
      if (!dragging || event.pointerId !== activePointer) return;
      tx += event.clientX - lastX;
      ty += event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      apply();
    });

    function endDrag(event) {
      if (event && event.pointerId !== activePointer) return;
      dragging = false;
      activePointer = null;
      try { stage.releasePointerCapture(event.pointerId); } catch (_) {}
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

  window.__hsInitZoom = initAll;
})();
