import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { assertPublishDate, isPublished } from "./publish-date";

const jargonDirectory = path.join(process.cwd(), "src/content/jargon");

// Pages that list or render glossary entries re-check publish dates on this
// window (seconds), so an entry dated today appears within 15 minutes of
// 00:00 New York time without a deploy.
export const JARGON_REVALIDATE_SECONDS = 900;

export interface JargonFAQ {
  question: string;
  answer: string;
}

export interface JargonExample {
  label: string;
  text: string;
}

export interface JargonPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  stat: string;
  statSource: string;
  quote: string;
  quoteContext: string;
  faqs: JargonFAQ[];
  examples: JargonExample[];
  contentHtml: string;
}

type JargonMeta = Omit<JargonPost, "contentHtml">;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function readEntry(slug: string): { meta: JargonMeta; content: string } | null {
  if (!SLUG.test(slug)) return null;
  const fullPath = path.join(jargonDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));
  const meta = {
    slug,
    ...data,
    date: assertPublishDate(data.date, `src/content/jargon/${slug}.md`),
    faqs: data.faqs ?? [],
    examples: data.examples ?? [],
  } as JargonMeta;
  return { meta, content };
}

function allSlugsOnDisk(): string[] {
  if (!fs.existsSync(jargonDirectory)) return [];
  return fs
    .readdirSync(jargonDirectory)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

/** Every entry on disk, published or not. For tests and schedule checks only. */
export function getAllJargonEntriesIncludingScheduled(): JargonMeta[] {
  return allSlugsOnDisk()
    .map((slug) => readEntry(slug)?.meta)
    .filter((m): m is JargonMeta => Boolean(m))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}

/** Published entries only, newest first. Future dated entries never appear. */
export function getSortedJargonData(now: Date = new Date()): JargonMeta[] {
  return getAllJargonEntriesIncludingScheduled().filter((m) => isPublished(m.date, now));
}

/**
 * Meta description for /glossary. Names up to three of the oldest published
 * terms (stable as new entries go live), never an unpublished one.
 */
export function glossaryMetaDescription(published: Pick<JargonMeta, "title" | "date">[]): string {
  const named = [...published]
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .slice(0, 3)
    .map((m) => `'${m.title.toLowerCase()},'`);
  const lead = "Authoritative definitions of corporate jargon from an 18 year insider.";
  if (named.length === 0) return `${lead} What these phrases actually mean, and why they exist.`;
  return `${lead} What ${named.join(" ")} and other phrases actually mean, and why they exist.`;
}

/** Slugs of published entries, for generateStaticParams. */
export function getAllJargonSlugs(now: Date = new Date()): { term: string }[] {
  return getSortedJargonData(now).map((m) => ({ term: m.slug }));
}

/** One published entry, or null when it is missing or not yet published. */
export async function getJargonData(slug: string, now: Date = new Date()): Promise<JargonPost | null> {
  const entry = readEntry(slug);
  if (!entry || !isPublished(entry.meta.date, now)) return null;
  const processed = await remark().use(html).process(entry.content);
  return { ...entry.meta, contentHtml: processed.toString() };
}
