import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const memosDirectory = path.join(process.cwd(), "src/content/field-memos");

export interface FieldMemoBody {
  slug: string;
  title: string;
  date: string;
  description: string;
  /** Optional canonical path override (e.g. "/blog/<slug>" when the memo mirrors a blog post). */
  canonical?: string;
  contentHtml: string;
}

export async function getFieldMemoBody(slug: string): Promise<FieldMemoBody | null> {
  const fullPath = path.join(memosDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const result = matter(fileContents);

  const processedContent = await remark().use(html).process(result.content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    ...result.data,
    // gray-matter parses unquoted YAML dates as Date objects; coerce to string
    date: String(result.data.date ?? ""),
  } as FieldMemoBody;
}
