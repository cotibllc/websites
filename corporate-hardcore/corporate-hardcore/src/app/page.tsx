import Navigation from "@/components/Navigation";
import NewsletterForm from "@/components/NewsletterForm";
import CorporateWisdom from "@/components/CorporateWisdom";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-main">
      <Navigation />

      {/* 3-col grid */}
      <div className="mx-auto content-max px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left rail */}
        <aside className="hidden lg:block space-y-4">
          <div className="surface-card p-4">
            <h3 className="font-semibold mb-2">About Chuck</h3>
            <p className="text-sm text-text-secondary">
              IT Manager, 18 years at the same company.
              Quietly documenting dysfunction.
            </p>
          </div>
          <CorporateWisdom />
        </aside>

        {/* Main feed */}
        <section className="lg:col-span-2 xl:col-span-1 space-y-6">
          <div className="surface-card p-6">
            <h1 className="text-2xl font-bold mb-2">Observational satire for the corporate lifer</h1>
            <p className="text-text-secondary mb-4">
              Not a rebellion. An observation. We follow Chuck Morrison through monthly arcs of office absurdity.
            </p>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-md bg-linkedin-blue text-white hover:bg-linkedin-blue-hover">
                Start Reading
              </button>
              <button className="px-4 py-2 rounded-md border border-border-medium hover:bg-btn-secondary">
                View Latest Video
              </button>
            </div>
          </div>

          {/* Article cards */}
          <div className="surface-card divide-y divide-border-light">
            <div className="p-6 hover:bg-gray-50 transition cursor-pointer">
              <span className="text-xs text-text-secondary uppercase tracking-wide">Performance Review Arc</span>
              <h2 className="mt-1 text-lg font-semibold">The Interview Wasn&apos;t an Evaluation</h2>
              <p className="mt-1 text-text-secondary">It was confirmation they&apos;d already decided.</p>
            </div>
            <div className="p-6 hover:bg-gray-50 transition cursor-pointer">
              <span className="text-xs text-text-secondary uppercase tracking-wide">Holiday Party Arc</span>
              <h2 className="mt-1 text-lg font-semibold">Mandatory Fun, Optional Attendance</h2>
              <p className="mt-1 text-text-secondary">The only thing worse was being there.</p>
            </div>
          </div>
        </section>

        {/* Right rail */}
        <aside className="hidden lg:block space-y-4">
          <div className="surface-card p-4">
            <h3 className="font-semibold mb-2">Stay Updated</h3>
            <NewsletterForm />
          </div>

          <div className="surface-card p-4">
            <h3 className="font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a className="text-linkedin-blue hover:underline" href="https://www.youtube.com/@corphardcore" target="_blank" rel="noopener noreferrer">YouTube Shorts</a></li>
              <li><a className="text-linkedin-blue hover:underline" href="https://www.instagram.com/corphardcore/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a className="text-linkedin-blue hover:underline" href="https://www.tiktok.com/@corphardcore" target="_blank" rel="noopener noreferrer">TikTok Clips</a></li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
