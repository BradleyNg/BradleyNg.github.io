/**
 * The site's motion language, in one place (anime.js v4).
 *
 * House rules, so added motion never costs usability:
 *   · Motion is opt-in: it runs only with JS, outside `?static=1`, and when
 *     the visitor has not asked for reduced motion.
 *   · Every animated element's SETTLED state is its CSS default. The initial
 *     (hidden/offset) state is applied only under `.js`, so no-JS, reduced
 *     motion, and crawlers all get the finished layout — never a blank one.
 *   · Micro-interactions stay in the 150–300ms band; entrances ease out.
 *   · Motion carries meaning where it can — the metric counters animate the
 *     change the number describes rather than decorating it.
 */
import { animate, createTimeline, createSpring, stagger, utils } from 'animejs';

export { animate, createTimeline, createSpring, stagger, utils };

/** Durations in ms. */
export const DUR = {
  micro: 200, // hover / press feedback
  enter: 520, // entrances
  settle: 900, // counters
  roll: 1100, // digit rolls
} as const;

/** Shared easings. `enter` mirrors the CSS reveal curve so both read alike. */
export const EASE = {
  enter: 'outQuint',
  micro: 'outQuad',
  settle: 'outExpo',
} as const;

/** True when animation is allowed for this visitor and this page load. */
export function motionOK(): boolean {
  return (
    document.documentElement.classList.contains('js') &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** The roll currently animating a given digit, so it can be cancelled. */
const inFlight = new WeakMap<HTMLElement, object>();

/** Runs `cb` once, the first time `el` scrolls into view. */
export function whenVisible(el: Element, cb: () => void, rootMargin = '0px 0px -10% 0px'): void {
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      cb();
    },
    { threshold: 0.15, rootMargin }
  );
  io.observe(el);
}

/**
 * Spins numerals down to rest, like a mechanical counter settling: the value
 * decelerates through whole digits, so the glyph changes fast at first and
 * slower as it lands. Each element carries its target in `data-final`.
 *
 * Re-entrant by design: calling this again on digits that are still rolling
 * cancels the old pass and starts a fresh one, so a repeated trigger keeps the
 * glyphs flipping rather than snapping them to their final values.
 */
export function rollDigits(
  digits: HTMLElement[],
  { duration = DUR.roll, step = 70, spins = 3 }: { duration?: number; step?: number; spins?: number } = {}
): void {
  digits.forEach((el, i) => {
    const finalChar = el.dataset.final ?? el.textContent ?? '';
    const target = Number.parseInt(finalChar, 10);
    if (Number.isNaN(target)) return;

    // Stop any roll still in flight on this digit so a re-trigger restarts
    // cleanly. Without this both animations would write the same glyph every
    // frame and the older one's completion would freeze it early.
    const prev = inFlight.get(el);
    if (prev) utils.remove(prev);

    // uneven spin counts keep the row from settling in lockstep
    const state = { v: target + 10 * (spins + (i % 2)) };
    inFlight.set(el, state);
    animate(state, {
      v: target,
      duration,
      delay: i * step,
      ease: EASE.settle,
      onUpdate: () => {
        el.textContent = String(((Math.floor(state.v) % 10) + 10) % 10);
      },
      onComplete: () => {
        el.textContent = finalChar;
      },
    });
  });
}

const NUMERAL = /\d[\d,]*(?:\.\d+)?/g;

/**
 * Counts a metric to its value, preserving whatever text surrounds it.
 *
 * Where a metric states a change ("90.9% → 26%") the LAST number is the
 * outcome and the FIRST is the baseline, so the readout literally performs the
 * drop it is reporting. A lone figure ("3,200+") counts up from zero. Decimal
 * places and thousands separators follow the target's own formatting.
 */
export function countMetric(el: HTMLElement): void {
  const text = el.dataset.value ?? el.textContent ?? '';
  const tokens = [...text.matchAll(NUMERAL)];
  if (tokens.length === 0) return;

  const last = tokens[tokens.length - 1]!;
  const raw = last[0];
  const target = Number.parseFloat(raw.replace(/,/g, ''));
  const from = tokens.length > 1 ? Number.parseFloat(tokens[0]![0].replace(/,/g, '')) : 0;
  if (Number.isNaN(target) || Number.isNaN(from)) return;

  const decimals = (raw.split('.')[1] ?? '').length;
  const grouped = raw.includes(',');
  const head = text.slice(0, last.index);
  const tail = text.slice(last.index! + raw.length);
  const format = (n: number) =>
    grouped
      ? n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : n.toFixed(decimals);

  const state = { v: from };
  animate(state, {
    v: target,
    duration: DUR.settle,
    ease: EASE.settle,
    onUpdate: () => {
      el.textContent = head + format(state.v) + tail;
    },
    // restore the authored string so formatting can never drift from content
    onComplete: () => {
      el.textContent = text;
    },
  });
}
