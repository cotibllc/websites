import { getAllContent, getContentItem, getContentSlugs } from "@/lib/content";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getContentSlugs("guest").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guest = await getContentItem("guest", slug);
  if (!guest) return {};
  const name = guest.frontMatter.Title ?? guest.frontMatter.title ?? slug;
  return { title: String(name) };
}

export default async function GuestPage({ params }: Props) {
  const { slug } = await params;
  const guest = await getContentItem("guest", slug);
  if (!guest) notFound();

  const { frontMatter, contentHtml } = guest;
  const name = String(frontMatter.Title ?? frontMatter.title ?? slug);
  const thumb = frontMatter.Thumbnail ?? frontMatter.thumbnail;
  const thumbStr = thumb ? String(thumb) : null;
  const pronouns = frontMatter.Pronouns ?? frontMatter.pronouns;
  const pronounsStr = pronouns ? String(pronouns) : null;

  const socials: { label: string; href: string }[] = [];
  const addSocial = (key: string, base: string) => {
    const val = frontMatter[key] ?? frontMatter[key.toLowerCase()];
    if (val && String(val).trim()) {
      const v = String(val);
      socials.push({ label: key, href: v.startsWith("http") ? v : `${base}${v}` });
    }
  };
  addSocial("Twitter", "https://twitter.com/");
  addSocial("GitHub", "https://github.com/");
  addSocial("Linkedin", "https://www.linkedin.com/in/");
  addSocial("Website", "");
  addSocial("Mastodon", "");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-start gap-6 mb-8">
        {thumbStr && (
          <Image
            src={`/${thumbStr}`}
            alt={name}
            width={96}
            height={96}
            className="rounded-full object-cover w-24 h-24 flex-shrink-0"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          {pronounsStr && <p className="text-sm text-gray-500 mt-1">{pronounsStr}</p>}
          {socials.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              {socials.map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline">
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      {contentHtml && (
        <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      )}
    </div>
  );
}
