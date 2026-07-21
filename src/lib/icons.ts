/**
 * Canonical list of built-in pixel icons (see PixelIcon.astro).
 * Shared by the content schema (`icon` fields validate against this list)
 * and the component (which renders them), so the two can never drift.
 */
export const PIXEL_ICONS = [
  'voxel-block', // Minecraft-ish grass block
  'gem', // faceted gem
  'star-bolt', // chunky star
  'microwave', // the Phone Microwave (Name Subject to Change)
  'key', // basement key
  'plus-ultra', // bold plus with burst
  'gamepad', // fallback for games
  'crt-tv', // fallback for anime
] as const;

export type PixelIconName = (typeof PIXEL_ICONS)[number];
