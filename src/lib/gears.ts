/**
 * Path generators for the clockwork art (see Backdrop.astro).
 * Everything returns SVG path data centered on (0,0), so callers position
 * pieces with `translate(...)` and rotate them freely.
 */

const pt = (r: number, a: number): string =>
  `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;

/**
 * A filled spur-gear ring — the silhouette of a clock wheel. Each tooth is
 * a trapezoid (wide base on the root circle, narrower tip), roots joined by
 * arcs; an inner circular subpath turns the disc into a toothed ring when
 * rendered with fill-rule="evenodd".
 *
 * teeth      number of teeth (clock wheels: lots of small ones)
 * rTip       radius at tooth tips
 * rRoot      radius at tooth roots (rim outer edge)
 * rInner     rim inner edge (the hole of the ring)
 * baseFrac   fraction of the pitch occupied by a tooth base (default .48)
 * tipFrac    fraction of the pitch occupied by a tooth tip (default .22)
 */
export function gearRing(
  teeth: number,
  rTip: number,
  rRoot: number,
  rInner: number,
  baseFrac = 0.48,
  tipFrac = 0.22
): string {
  const pitch = (Math.PI * 2) / teeth;
  const parts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const c = i * pitch;
    const a1 = c - (baseFrac / 2) * pitch; // tooth base, leading edge
    const a2 = c - (tipFrac / 2) * pitch; // tip, leading corner
    const a3 = c + (tipFrac / 2) * pitch; // tip, trailing corner
    const a4 = c + (baseFrac / 2) * pitch; // tooth base, trailing edge
    const next = (i + 1) * pitch - (baseFrac / 2) * pitch; // next tooth's base
    parts.push(
      `${i === 0 ? `M ${pt(rRoot, a1)}` : ''} L ${pt(rTip, a2)} L ${pt(rTip, a3)} L ${pt(rRoot, a4)}` +
        ` A ${rRoot} ${rRoot} 0 0 1 ${pt(rRoot, next)}`
    );
  }
  parts.push('Z');
  parts.push(circle(rInner));
  return parts.join(' ');
}

/** A full circle as a path subpath (for evenodd holes). */
export function circle(r: number): string {
  return `M ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 Z`;
}

/** A circle subpath at an offset center (for drilled holes, evenodd-ready). */
export function circleAt(cx: number, cy: number, r: number): string {
  return `M ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} Z`;
}

/**
 * The splash-art gear: a solid disc with many small blocky teeth and a
 * small center hole (gearRing with a tight rTip/rRoot delta, high tooth
 * count, and rInner as the hub hole). Optional drilled holes around the
 * hub, like the key art's machined wheels.
 */
export function fineGear(teeth: number, rTip: number, rRoot: number, rHole: number, drills = 0, rDrillOrbit = 0, rDrill = 0): string {
  let d = gearRing(teeth, rTip, rRoot, rHole, 0.58, 0.34);
  for (let i = 0; i < drills; i++) {
    const a = (i / drills) * Math.PI * 2 + Math.PI / drills;
    d += ' ' + circleAt(rDrillOrbit * Math.cos(a), rDrillOrbit * Math.sin(a), rDrill);
  }
  return d;
}

/**
 * Radial tick marks for a clock face: `count` ticks between rInner→rOuter.
 * Render as a stroked path.
 */
export function clockTicks(count: number, rInner: number, rOuter: number): string {
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    parts.push(`M ${pt(rInner, a)} L ${pt(rOuter, a)}`);
  }
  return parts.join(' ');
}

/**
 * A tapered clock hand pointing up (12 o'clock); rotate to set the time.
 * length from center; base width tapers to a point-ish tip.
 */
export function hand(length: number, baseWidth: number): string {
  const half = baseWidth / 2;
  return `M ${-half} ${baseWidth} L ${half} ${baseWidth} L ${half * 0.28} ${-length} L ${-half * 0.28} ${-length} Z`;
}
