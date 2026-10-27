import Link from "next/link";
import { Suspense } from "react";
import { Lead, LeadFallback, LeadSkeleton } from "@/components/Lead";
import PostRow from "@/components/PostRow";
import StartHere from "@/components/StartHere";
import { fetchFeed } from "@/lib/feed";
import { selectHome } from "@/lib/home";
import { nextLabel, nextWednesday } from "@/lib/schedule";
import { SUBSTACK_URL } from "@/lib/site";

export const revalidate = 3600; // hourly; must be a literal for Next

/** Everything that depends on the Substack feed. It renders in every feed state. */
async function FeedSections() {
  const feed = await fetchFeed();
  const now = new Date();
  const { lead, recent } = selectHome(feed.posts);
  const next = nextLabel(
    nextWednesday(
      now,
      feed.posts.map((p) => p.publishedAt)
    ),
    now
  );

  return (
    <>
      <section className="lead-section" aria-label="Latest article">
        <div className="container-wide">{lead ? <Lead post={lead} next={next} /> : <LeadFallback next={next} />}</div>
      </section>

      {recent.length > 0 && (
        <section className="band" aria-labelledby="recent-heading">
          <div className="container-wide">
            <h2 className="section-label" id="recent-heading">
              Recent
            </h2>
            <ul className="rows">
              {recent.map((post, i) => (
                <PostRow key={post.slug} post={post} size={i === 0 ? "major" : "compact"} />
              ))}
            </ul>
            <p className="shelf-link">
              <Link href="/archive" className="text-link">
                Every article, by date
              </Link>
            </p>
          </div>
        </section>
      )}

      <StartHere feedPosts={feed.posts} />
    </>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="nameplate" aria-label="Tech Lead Shift">
        <div className="container-wide">
          <p className="eyebrow">Silicon Labor</p>
          <h1>Manage the machine, not the sentiment.</h1>
          <p className="cadence-line">New articles twice a month, on Wednesdays.</p>
        </div>
      </section>

      <Suspense
        fallback={
          <section className="lead-section" aria-label="Latest article">
            <div className="container-wide">
              <LeadSkeleton />
            </div>
          </section>
        }
      >
        <FeedSections />
      </Suspense>

      <section id="subscribe" aria-labelledby="subscribe-heading">
        <div className="container">
          <div className="subscribe-inner">
            <div className="section-label">Subscribe</div>
            <h2 className="section-headline" id="subscribe-heading">
              New articles twice a month.
            </h2>
            <p>
              Published Wednesday mornings on Substack. No filler content, no weekly digests. One article every other Wednesday, when
              it&apos;s worth your time.
            </p>
            <p>
              Subscribe directly on Substack and you will also get access to Notes, shorter observations from the week that do not make it
              into articles.
            </p>
            <div style={{ marginTop: "2rem" }}>
              <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Subscribe on Substack
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="about" aria-labelledby="about-heading">
        <div className="container">
          <div className="section-label">About</div>
          <div className="about-grid">
            <div>
              <h2 className="section-headline" id="about-heading">
                Charles Betancourt
              </h2>
              <div className="about-body">
                <p>
                  18+ years of technology leadership.{" "}
                  <strong>Now writing about what happens to leadership when some of your team members aren&apos;t human.</strong>
                </p>
                <p>
                  Tech Lead Shift is not academic research. It is practitioner observation. Every article starts with something real that
                  happened during a week of leading technology teams, and pulls back to the pattern it reveals.
                </p>
                <p>Writing about leadership, AI, and the humans caught in between.</p>
              </div>
              <p className="work-home-link">
                <Link href="/work" className="text-link">
                  Work with Charles
                </Link>
              </p>
            </div>
            <blockquote className="about-quote">
              <p>&ldquo;You don&apos;t lead machines with presence. You lead them with parameters.&rdquo;</p>
              <cite>Charles Betancourt</cite>
            </blockquote>
          </div>
        </div>
      </section>
    </>
  );
}
