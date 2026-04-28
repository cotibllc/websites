import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const jargonDirectory = path.join(process.cwd(), "src/content/jargon");

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

export function getSortedJargonData(): Omit<JargonPost, "contentHtml">[] {
  if (!fs.existsSync(jargonDirectory)) return [];

  const fileNames = fs.readdirSync(jargonDirectory);
  const allData = fileNames
    .filter((f) => f.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(jargonDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        ...data,
        date: String(data.date ?? ""),
        faqs: data.faqs ?? [],
        examples: data.examples ?? [],
      } as Omit<JargonPost, "contentHtml">;
    });

  return allData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllJargonSlugs() {
  if (!fs.existsSync(jargonDirectory)) return [];
  return fs
    .readdirSync(jargonDirectory)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ term: f.replace(/\.md$/, "") }));
}

export async function getJargonData(slug: string): Promise<JargonPost | null> {
  const fullPath = path.join(jargonDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processed = await remark().use(html).process(content);

  return {
    slug,
    contentHtml: processed.toString(),
    ...data,
    date: String(data.date ?? ""),
    faqs: data.faqs ?? [],
    examples: data.examples ?? [],
  } as JargonPost;
}
