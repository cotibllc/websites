import { getAllContent } from "@/lib/content";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Guests" };

export default async function GuestsPage() {
  const guests = await getAllContent("guest");

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-10">Guests</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {guests.map(({ slug, frontMatter }) => {
          const thumbStr = frontMatter.Thumbnail ?? frontMatter.thumbnail;
          const nameStr = String(frontMatter.Title ?? frontMatter.title ?? slug);
          return (
            <Link
              key={slug}
              href={`/guest/${slug}`}
              className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              {thumbStr != null && (
                <Image
                  src={`/${String(thumbStr)}`}
                  alt={nameStr}
                  width={56}
                  height={56}
                  className="rounded-full object-cover w-14 h-14 flex-shrink-0"
                />
              )}
              <span className="font-semibold text-gray-900">{nameStr}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
