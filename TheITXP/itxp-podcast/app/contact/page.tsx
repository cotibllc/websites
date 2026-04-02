import { getSinglePage } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const page = await getSinglePage("contact.md");
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Contact</h1>
      {page ? (
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: page.contentHtml }}
        />
      ) : (
        <p className="text-gray-600">
          Reach us at{" "}
          <a href="mailto:social-media@theitxp.com" className="text-blue-600 hover:underline">
            social-media@theitxp.com
          </a>
        </p>
      )}
    </div>
  );
}
