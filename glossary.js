/**
 * glossary.js
 * Dependency-free glossary hover/focus/tap definitions.
 *
 * Markup contract (author-facing):
 *   <span class="glossary-term" data-term="dsa" tabindex="0">DSA</span>
 *
 * One shared tooltip element is created lazily and reused for every term.
 * All listeners are delegated on `document` — no per-term listeners.
 */
(function () {
  "use strict";

  // ---------------------------------------------------------------
  // 1. Definitions data, keyed by term id (the `data-term` value).
  // ---------------------------------------------------------------
  var GLOSSARY = {
    dsa: {
      term: "DSA",
      definition:
        "Data Structures and Algorithms — the toolkit for organizing data efficiently and designing step-by-step solutions to problems."
    },
    cgpa: {
      term: "CGPA",
      definition:
        "Cumulative Grade Point Average — a weighted average of grades across all completed semesters, out of a maximum of 10 here."
    },
    git: {
      term: "Git",
      definition:
        "A version control system that tracks changes to code over time, so a team can work on the same project without overwriting each other's work."
    },
    leetcode: {
      term: "LeetCode",
      definition:
        "An online platform with coding challenges used to practice data structures, algorithms, and interview-style problem solving."
    }
  };

  // ---------------------------------------------------------------
  // 2. Shared tooltip element (created once, reused for every term).
  // ---------------------------------------------------------------
  var TOOLTIP_ID = "glossary-tooltip";
  var tooltip = null;
  var activeTerm = null;

  function ensureTooltip() {
    if (tooltip) return tooltip;
    tooltip = document.createElement("div");
    tooltip.id = TOOLTIP_ID;
    tooltip.className = "glossary-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.hidden = true;
    document.body.appendChild(tooltip);
    return tooltip;
  }

  // ---------------------------------------------------------------
  // 3. Positioning: above by default, flip below if there's no room,
  //    and clamp horizontally so it never overflows the viewport.
  // ---------------------------------------------------------------
  function positionTooltip(target, tip) {
    var margin = 8;
    var targetRect = target.getBoundingClientRect();
    var tipRect = tip.getBoundingClientRect();

    var placement = "top";
    var top = targetRect.top - tipRect.height - margin;

    if (top < margin) {
      placement = "bottom";
      top = targetRect.bottom + margin;
    }

    var left = targetRect.left + targetRect.width / 2 - tipRect.width / 2;
    var minLeft = margin;
    var maxLeft = window.innerWidth - tipRect.width - margin;

    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;

    tip.style.top = top + window.scrollY + "px";
    tip.style.left = left + window.scrollX + "px";
    tip.setAttribute("data-placement", placement);
  }

  // ---------------------------------------------------------------
  // 4. Open / close.
  // ---------------------------------------------------------------
  function openFor(target) {
    var id = target.getAttribute("data-term");
    var entry = GLOSSARY[id];

    if (!entry) {
      console.warn('[glossary] Unknown data-term "' + id + '" — no definition found.');
      return;
    }

    var tip = ensureTooltip();

    if (activeTerm && activeTerm !== target) {
      activeTerm.removeAttribute("aria-describedby");
    }

    tip.textContent = entry.definition;
    tip.hidden = false; // must happen before measuring for position
    positionTooltip(target, tip);
    tip.classList.add("is-visible"); // added after layout so the fade can transition

    target.setAttribute("aria-describedby", TOOLTIP_ID);
    activeTerm = target;
  }

  function closeTooltip() {
    if (!tooltip) return;
    tooltip.classList.remove("is-visible");
    tooltip.hidden = true;
    if (activeTerm) {
      activeTerm.removeAttribute("aria-describedby");
      activeTerm = null;
    }
  }

  function isOpen() {
    return !!(tooltip && !tooltip.hidden);
  }

  // ---------------------------------------------------------------
  // 5. Event delegation on `document` — no per-term listeners.
  // ---------------------------------------------------------------
  var lastInputWasTouch = false;

  document.addEventListener(
    "touchstart",
    function () {
      lastInputWasTouch = true;
    },
    { passive: true }
  );

  document.addEventListener("mousedown", function () {
    lastInputWasTouch = false;
  });

  document.addEventListener("mouseover", function (e) {
    var target = e.target.closest && e.target.closest(".glossary-term");
    if (!target) return;
    if (e.relatedTarget && target.contains(e.relatedTarget)) return;
    openFor(target);
  });

  document.addEventListener("mouseout", function (e) {
    var target = e.target.closest && e.target.closest(".glossary-term");
    if (!target) return;
    if (e.relatedTarget && target.contains(e.relatedTarget)) return;
    closeTooltip();
  });

  document.addEventListener("focusin", function (e) {
    var target = e.target.closest && e.target.closest(".glossary-term");
    if (target) openFor(target);
  });

  document.addEventListener("focusout", function (e) {
    var target = e.target.closest && e.target.closest(".glossary-term");
    if (target) closeTooltip();
  });

  document.addEventListener("keydown", function (e) {
    if ((e.key === "Escape" || e.key === "Esc") && isOpen()) {
      closeTooltip();
    }
  });

  // Tap-to-toggle on touch devices; tap outside closes the tooltip.
  document.addEventListener("click", function (e) {
    var target = e.target.closest && e.target.closest(".glossary-term");

    if (target) {
      if (lastInputWasTouch) {
        e.preventDefault();
        if (activeTerm === target && isOpen()) {
          closeTooltip();
        } else {
          openFor(target);
        }
      }
      return;
    }

    if (isOpen() && tooltip && !tooltip.contains(e.target)) {
      closeTooltip();
    }
  });
})();
