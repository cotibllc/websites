import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type FrontMatterValue = string | number | boolean | string[] | null | undefined;

export interface FrontMatter {
  [key: string]: FrontMatterValue;
}

export interface ContentItem {
  slug: string;
  frontMatter: FrontMatter;
  contentHtml: string;
}

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(remarkHtml, { sanitize: false }).process(markdown);
  return result.toString();
}

function getSlug(filename: string): string {
  return filename.replace(/\.md$/, "");
}

export function getContentSlugs(type: string): string[] {
  const dir = path.join(CONTENT_DIR, type);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map(getSlug);
}

export async function getContentItem(type: string, slug: string): Promise<ContentItem | null> {
  const filePath = path.join(CONTENT_DIR, type, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  // Hugo uses TOML (+++) or YAML (---) front matter; gray-matter handles both
  const { data, content } = matter(raw, {
    delimiters: ["+++", "+++"],
    language: "toml",
    engines: {
      toml: (str: string) => {
        // Simple TOML parser for the fields we use
        const result: Record<string, unknown> = {};
        for (const line of str.split("\n")) {
          const match = line.match(/^\s*(\w+)\s*=\s*(.+?)\s*$/);
          if (!match) continue;
          const [, key, rawVal] = match;
          // Array
          if (rawVal.startsWith("[")) {
            result[key] = rawVal
              .slice(1, -1)
              .split(",")
              .map((v) => v.trim().replace(/^"|"$/g, ""))
              .filter(Boolean);
          // Boolean
          } else if (rawVal === "true" || rawVal === "false") {
            result[key] = rawVal === "true";
          // Quoted string
          } else if (rawVal.startsWith('"') || rawVal.startsWith("'")) {
            result[key] = rawVal.slice(1, -1);
          // Number
          } else if (!isNaN(Number(rawVal))) {
            result[key] = Number(rawVal);
          } else {
            result[key] = rawVal;
          }
        }
        return result;
      },
    },
  });

  const contentHtml = await markdownToHtml(content);
  return { slug, frontMatter: data, contentHtml };
}

export async function getAllContent(type: string): Promise<ContentItem[]> {
  const slugs = getContentSlugs(type);
  const items = await Promise.all(slugs.map((slug) => getContentItem(type, slug)));
  return items.filter(Boolean) as ContentItem[];
}

/** Convenience: get a single markdown file (not in a subdir), e.g. content/contact.md */
export async function getSinglePage(filename: string): Promise<ContentItem | null> {
  const filePath = path.join(CONTENT_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const contentHtml = await markdownToHtml(content);
  return { slug: filename.replace(/\.md$/, ""), frontMatter: data, contentHtml };
}
