import { getSinglePage } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const page = await getSinglePage("about/about.md");
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">About</h1>
      {page ? (
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: page.contentHtml }}
        />
      ) : (
        <p className="text-gray-600">
          The IT XP is a podcast for IT professionals hosted by Chuck Betancourt.
        </p>
      )}
    </div>
  );
}
