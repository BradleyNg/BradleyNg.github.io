/**
 * ───────────────────────────────────────────────────────────────────────────
 *  CONTENT SCHEMAS — the single source of truth for every data file's shape.
 *
 *  ▸ Actual content lives in `src/content/*.json` (+ `src/content/about.md`).
 *  ▸ To EDIT content you never touch this file — see EDITING.md at the repo
 *    root. This file only defines what each field means, and validates every
 *    data file when the site builds.
 *  ▸ A bad edit (wrong type, missing field, misspelled key) fails
 *    `npm run validate` with a message naming the exact file and field, so
 *    broken content can never silently ship.
 *
 *  Conventions shared by all files:
 *  ▸ `_readme` (file level) and `_note` (entry level) are editor notes.
 *    They are never rendered on the site.
 *  ▸ `hidden: true` on any list entry removes it from the page without
 *    deleting its data — safer than deleting lines.
 *  ▸ Array order = display order (except games/anime, sorted by `rank`).
 *  ▸ In fields marked "supports **bold**", text wrapped in double asterisks
 *    renders highlighted. No other markup is allowed in JSON strings.
 * ───────────────────────────────────────────────────────────────────────────
 */
import { z } from 'astro/zod';
import { PIXEL_ICONS } from './icons';

import profileRaw from '../content/profile.json';
import sectionsRaw from '../content/sections.json';
import experienceRaw from '../content/experience.json';
import projectsRaw from '../content/projects.json';
import skillsRaw from '../content/skills.json';
import credentialsRaw from '../content/credentials.json';
import interestsRaw from '../content/interests.json';

/* ── Shared helpers ──────────────────────────────────────────────────────── */

const text = z.string().min(1, 'must not be empty');
const note = z.string().optional(); // `_note`: editor-only, never rendered
const hidden = z.boolean().optional(); // `hidden: true` removes an entry from the page
const url = z.string().url('must be a full URL starting with https://');

/** A path under public/, e.g. "/images/projects/memeotron/demo.gif" */
const publicPath = z
  .string()
  .regex(/^\/[^\s]+$/, 'must be a path starting with "/" that points inside the public/ folder');

/* ── profile.json — identity + hero ──────────────────────────────────────── */

const ProfileSchema = z
  .object({
    _readme: note,
    name: text, // full name, used in the hero and page <title>
    headline: text, // short line under the name, e.g. "CS @ UT Dallas · Class of 2028"
    location: text, // city, state — shown next to the headline
    positioning: text, // 1–2 sentence pitch under the name; also the meta description
    email: z.string().email(), // contact email — the site's main CTA
    resumeFile: publicPath, // path to the résumé PDF inside public/
    badge: z.string().optional(), // small hardware chip beside the hero kicker — off by default; add the field to show one
    availability: z.string().optional(), // short status on the About profile card, e.g. "open to internships" — delete to hide the row
    meter: z
      .object({
        value: z.string().regex(/^[0-9.]+$/, 'digits and dots only, e.g. "1.048596"'), // the nixie reading in the dark theme (the β world line)
        label: text, // caption under the tubes in the dark theme
        lightValue: z
          .string()
          .regex(/^[0-9.]+$/, 'digits and dots only, e.g. "0.571024"')
          .optional(), // reading in the light theme (the α world line); omit to show the same number in both
        lightLabel: z.string().optional(), // caption in the light theme; omit to reuse `label`
      })
      .strict()
      .optional(), // the hero divergence meter — delete the field to hide it
    dmailSubject: z.string().optional(), // SUBJ line in the footer's D-Mail composer — delete to hide the line
    links: z.array(z.object({ label: text, url, hidden }).strict()), // social/profile links
    metrics: z.array(z.object({ value: text, label: text, hidden }).strict()), // hero "readout row": value = the number, label = what it means
  })
  .strict();

/* ── sections.json — headings + nav labels ───────────────────────────────── */

const SectionHeading = z
  .object({
    navLabel: text, // word shown in the top navigation
    title: text, // big serif heading of the section
    subtitle: z.string().optional(), // smaller line under the title (optional)
  })
  .strict();

const SectionsSchema = z
  .object({
    _readme: note,
    about: SectionHeading,
    experience: SectionHeading,
    projects: SectionHeading,
    credentials: SectionHeading,
    offTheClock: SectionHeading,
    contact: SectionHeading,
    notFound: z
      .object({
        title: text, // heading on the 404 page
        cta: text, // text of the back-to-home link
      })
      .strict(),
  })
  .strict();

/* ── experience.json — roles ─────────────────────────────────────────────── */

const ExperienceSchema = z
  .object({
    _readme: note,
    entries: z.array(
      z
        .object({
          role: text, // job title, e.g. "Software Engineer Intern"
          org: text, // company / lab / organization
          start: text, // e.g. "Sep 2025"
          end: text, // e.g. "Feb 2026" or "Present"
          location: text, // e.g. "Richardson, TX"
          bullets: z.array(text).min(1), // achievement bullets; supports **bold**
          tech: z.array(text).default([]), // tools used — small mono list under the bullets
          hidden,
          _note: note,
        })
        .strict()
    ),
  })
  .strict();

/* ── projects.json — project cards ───────────────────────────────────────── */

const VisualSchema = z
  .object({
    src: publicPath, // image/GIF path under public/, e.g. "/images/projects/utd-clubs/mobile.png"
    alt: text, // REQUIRED — describe the image for screen readers
    caption: z.string().optional(), // short figure caption; falls back to alt if omitted
  })
  .strict();

const ProjectSchema = z
  .object({
    title: text, // project name
    timeframe: z.string().optional(), // small date label beside the FG code, e.g. "Jan – May 2026"
    tagline: text, // one italic line under the title
    category: text, // small chip label, e.g. "Hackathon", "AI Security Research"
    description: text, // 2–4 sentences; supports **bold**
    highlights: z.array(text).max(4), // up to 4 short metric chips, e.g. "95% OCR accuracy"
    tech: z.array(text).default([]), // stack list
    links: z
      .object({ repo: url.optional(), demo: url.optional(), devpost: url.optional(), writeup: url.optional() })
      .strict()
      .default({}), // omit keys that don't exist — only present ones render
    visuals: z.array(VisualSchema).default([]), // screenshots/diagrams/GIFs; empty = styled placeholder frame
    hidden,
    _note: note,
  })
  .strict();

const ProjectsSchema = z.object({ _readme: note, entries: z.array(ProjectSchema) }).strict();

/* ── skills.json — grouped skill chips ───────────────────────────────────── */

const SkillsSchema = z
  .object({
    _readme: note,
    groups: z.array(
      z
        .object({
          label: text, // group heading, e.g. "Languages"
          items: z.array(text).min(1), // the chips
          hidden,
        })
        .strict()
    ),
  })
  .strict();

/* ── credentials.json — education, certifications, awards ────────────────── */

const CredentialsSchema = z
  .object({
    _readme: note,
    education: z.array(
      z
        .object({
          institution: text, // school name
          credential: text, // degree, e.g. "B.S. in Computer Science"
          timeframe: text, // e.g. "Aug 2025 — May 2028 (expected)"
          location: z.string().optional(),
          coursework: z.array(text).default([]), // relevant coursework list (optional)
          hidden,
        })
        .strict()
    ),
    certifications: z.array(
      z
        .object({
          name: text, // certification name
          issuer: text, // who issued it
          year: z.string().optional(), // e.g. "2026" (optional)
          hidden,
        })
        .strict()
    ),
    awards: z.array(
      z
        .object({
          name: text, // award name incl. placement
          issuer: z.string().optional(), // who awarded it
          detail: z.string().optional(), // e.g. "Spring 2024"
          hidden,
        })
        .strict()
    ),
  })
  .strict();

/* ── interests.json — the "Off the clock" personal section ───────────────── */

const InterestsSchema = z
  .object({
    _readme: note,
    intro: text, // paragraph that opens the section
    gamesLabel: text, // heading over the game cards, e.g. "Save data"
    animeLabel: text, // heading over the anime list, e.g. "Watch log"
    games: z.array(
      z
        .object({
          rank: z.number().int().min(1), // 1 = favorite; list is sorted by this
          title: text,
          blurb: text, // 1–2 sentences in your voice
          icon: z.enum(PIXEL_ICONS).optional(), // built-in pixel icon for the card thumbnail; omit → gamepad. Valid names: voxel-block, gem, star-bolt, microwave, key, plus-ultra, gamepad, crt-tv
          image: publicPath.optional(), // optional cover art for the thumbnail band (e.g. "/images/interests/minecraft.jpg"); shown instead of the icon when the file exists
          stat: z.string().optional(), // optional mono footer line, rendered uppercase
          hidden,
        })
        .strict()
    ),
    anime: z.array(
      z
        .object({
          rank: z.number().int().min(1), // 1 = favorite; list is sorted by this
          title: text,
          blurb: text,
          icon: z.enum(PIXEL_ICONS).optional(), // built-in pixel icon beside the rank; omit → crt-tv. Same valid names as games
          image: publicPath.optional(), // optional art for the small well beside the rank; shown instead of the icon when the file exists
          status: z.string().optional(), // e.g. "rewatched" — small chip, rendered uppercase
          hidden,
        })
        .strict()
    ),
  })
  .strict();

/* ── Validation with readable errors ─────────────────────────────────────── */

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown, file: string): z.output<S> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const issues = result.error.issues
    .map((i) => `  → ${i.path.map((p) => (typeof p === 'number' ? `[${p}]` : p)).join(' → ') || '(top level)'}: ${i.message}`)
    .join('\n');
  throw new Error(
    `\n\n✖ Invalid content in src/content/${file}\n${issues}\n\n` +
      `Fix the field(s) above, then re-run \`npm run validate\`.\n` +
      `Field-by-field docs: src/lib/content.ts · editing guide: EDITING.md\n`
  );
}

const notHidden = <T extends { hidden?: boolean }>(item: T) => !item.hidden;
const byRank = (a: { rank: number }, b: { rank: number }) => a.rank - b.rank;

/* ── Validated, ready-to-render exports (hidden entries already removed) ─── */

const profileAll = validate(ProfileSchema, profileRaw, 'profile.json');
export const profile = {
  ...profileAll,
  links: profileAll.links.filter(notHidden),
  metrics: profileAll.metrics.filter(notHidden),
};

export const sections = validate(SectionsSchema, sectionsRaw, 'sections.json');

export const experience = validate(ExperienceSchema, experienceRaw, 'experience.json').entries.filter(notHidden);

export const projects = validate(ProjectsSchema, projectsRaw, 'projects.json').entries.filter(notHidden);

export const skills = validate(SkillsSchema, skillsRaw, 'skills.json').groups.filter(notHidden);

const credentialsAll = validate(CredentialsSchema, credentialsRaw, 'credentials.json');
export const credentials = {
  education: credentialsAll.education.filter(notHidden),
  certifications: credentialsAll.certifications.filter(notHidden),
  awards: credentialsAll.awards.filter(notHidden),
};

const interestsAll = validate(InterestsSchema, interestsRaw, 'interests.json');
export const interests = {
  ...interestsAll,
  games: interestsAll.games.filter(notHidden).sort(byRank),
  anime: interestsAll.anime.filter(notHidden).sort(byRank),
};
