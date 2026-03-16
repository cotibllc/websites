import Navigation from "@/components/Navigation";
import { Mail, MapPin, Building2, Calendar } from "lucide-react";

export const metadata = {
  title: "About | Corporate Hardcore",
  description: "Meet Chuck Morrison. IT Manager. 18 years. Still here.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-bg-main">
      <Navigation />

      {/* Hero banner */}
      <div className="bg-linkedin-blue h-20" />

      <div className="mx-auto content-max px-4 -mt-12 pb-12">
        <div className="surface-card">
          {/* Profile header */}
          <div className="px-6 md:px-8 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="w-28 h-28 rounded-lg bg-bg-main border-4 border-card-bg shadow-sm flex items-center justify-center">
                <span className="text-4xl font-bold text-text-secondary">CM</span>
              </div>
              
              <div className="flex-1 pb-2">
                <h1 className="text-2xl font-bold text-text-primary">Chuck Morrison</h1>
                <p className="text-text-secondary">IT Manager at Synergy Corp</p>
                <p className="text-sm text-text-secondary mt-1">
                  18 years in the same company. Former pre-med. Still trying to figure out what happened.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-6 md:px-8 py-4 border-t border-border-light flex flex-wrap gap-3">
            <button className="px-4 py-2 rounded-full bg-linkedin-blue text-white text-sm font-medium hover:bg-linkedin-blue-hover transition">
              Connect
            </button>
            <button className="px-4 py-2 rounded-full border border-border-medium text-text-primary text-sm font-medium hover:bg-btn-secondary transition">
              Message
            </button>
          </div>

          {/* Main content grid */}
          <div className="px-6 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - About */}
            <div className="lg:col-span-2 space-y-8">
              {/* About section */}
              <section>
                <h2 className="text-lg font-semibold mb-3">About</h2>
                <div className="space-y-4 text-text-primary">
                  <p>
                    I&apos;ve been an IT Manager at Synergy Corp for eighteen years. That&apos;s not a typo.
                    Eighteen years at the same company. Same building. Same fluorescent lights.
                    Some people would call that loyalty. I&apos;m not sure what to call it yet.
                  </p>
                  <p>
                    Before IT, I was pre-med. I was going to be a doctor. I had a 3.8 GPA,
                    volunteered at a hospital, the whole thing. Then I took an IT job to pay
                    for graduate school. That was 1998. I never went back.
                  </p>
                  <p>
                    Now I&apos;m fifty. My daughters are sixteen and fourteen. My wife asks why
                    I still go to the office every day. I tell her it&apos;s for the synergy.
                    She doesn&apos;t laugh, but she doesn&apos;t argue either.
                  </p>
                  <p>
                    This project — Corporate Hardcore — started as something to show my 
                    teenagers when they asked what I do all day. It turned into a way of 
                    seeing things. The quiet absurdity of corporate life. The meetings that 
                    could have been emails. The vision statements that say nothing. The 
                    mandatory fun that feels optional in all the wrong ways.
                  </p>
                  <p>
                    I don&apos;t complain. I don&apos;t rebel. I just observe. And document.
                    Because someone should.
                  </p>
                </div>
              </section>

              {/* Projects section */}
              <section>
                <h2 className="text-lg font-semibold mb-3">Projects</h2>
                <div className="surface-card divide-y divide-border-light">
                  <div className="p-4">
                    <h3 className="font-medium">Corporate Hardcore</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Observational satire documenting corporate dysfunction through monthly video arcs and written articles.
                    </p>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">Synergy Archive</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      A personal collection of internal emails, vision statements, and meeting notes from 2008-present.
                    </p>
                  </div>
                </div>
              </section>

              {/* Featured content */}
              <section>
                <h2 className="text-lg font-semibold mb-3">Featured</h2>
                <div className="surface-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-linkedin-blue/10 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-linkedin-blue font-bold">CH</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Performance Review Arc</h3>
                      <p className="text-sm text-text-secondary mt-1">
                        A three-part series on what happens when you realize the interview was never an evaluation.
                      </p>
                      <span className="text-xs text-text-secondary mt-2 block">3 articles · Nov 2025</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right column - Sidebar */}
            <aside className="space-y-6">
              {/* Contact info */}
              <section className="surface-card p-4">
                <h3 className="font-semibold mb-3">Contact</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2 text-text-secondary">
                    <Mail className="w-4 h-4" />
                    <span>chuck.morrison@corphardcore.com</span>
                  </li>
                  <li className="flex items-center gap-2 text-text-secondary">
                    <MapPin className="w-4 h-4" />
                    <span>Washington D.C. Area</span>
                  </li>
                </ul>
              </section>

              {/* Current company */}
              <section className="surface-card p-4">
                <h3 className="font-semibold mb-3">Current</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Synergy Corp</p>
                    <p className="text-xs text-text-secondary">IT Manager</p>
                  </div>
                </div>
              </section>

              {/* Education */}
              <section className="surface-card p-4">
                <h3 className="font-semibold mb-3">Education</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-sm">B.S. Biology</p>
                    <p className="text-xs text-text-secondary">University of Maryland</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Minor in Computer Science</p>
                    <p className="text-xs text-text-secondary">Because here we are.</p>
                  </div>
                </div>
              </section>

              {/* Joined */}
              <section className="surface-card p-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Calendar className="w-4 h-4" />
                  <span>Joined March 2008</span>
                </div>
              </section>

              {/* Social */}
              <section className="surface-card p-4">
                <h3 className="font-semibold mb-3">Follow</h3>
                <div className="flex flex-wrap gap-2">
                  <a href="https://www.youtube.com/@corphardcore" target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-full border border-border-medium text-text-primary text-xs font-medium hover:bg-btn-secondary">
                    YouTube
                  </a>
                  <a href="https://x.com/corphardcore" target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-full border border-border-medium text-text-primary text-xs font-medium hover:bg-btn-secondary">
                    X
                  </a>
                  <a href="https://www.tiktok.com/@corphardcore" target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-full border border-border-medium text-text-primary text-xs font-medium hover:bg-btn-secondary">
                    TikTok
                  </a>
                  <a href="https://www.instagram.com/corphardcore/" target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-full border border-border-medium text-text-primary text-xs font-medium hover:bg-btn-secondary">
                    Instagram
                  </a>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>

    </main>
  );
}
