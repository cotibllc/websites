import ContactForm from "@/components/ContactForm";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section id="home">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-rule">
            <div className="hero-rule-line"></div>
            <span className="hero-eyebrow">A research-backed leadership series</span>
          </div>
          <h1 className="hero-headline">
            The first AI leadership crisis<br />
            won&apos;t be <em>technical.</em><br />
            It will be cultural.
          </h1>
          <p className="hero-sub">
            What leadership competencies are required to manage hybrid teams of human workers
            and autonomous AI agents, and how do current frameworks fail to address them?
          </p>
          <div className="hero-cta-group">
            <a
              href="https://techleadshift.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Read the Series
            </a>
            <a href="#about" className="btn-secondary">About Charles</a>
          </div>
        </div>
        <div className="hero-watermark">Shift</div>
      </section>

      {/* THESIS STRIP */}
      <div className="thesis-strip">
        <div className="thesis-inner">
          <p className="thesis-quote">
            &ldquo;The frameworks we&apos;ve been using were built for an all-human workforce.
            That assumption is already broken. Most of us just haven&apos;t named it yet.&rdquo;
          </p>
          <span className="thesis-attr">
            Tech Lead Shift<br />Article II
          </span>
        </div>
      </div>

      {/* ABOUT */}
      <section id="about">
        <div className="container">
          <div className="section-label">About</div>
          <div className="about-grid">
            <div>
              <h2 className="section-headline">Charles Betancourt</h2>
              <div className="about-body">
                <p>
                  <strong>Director of Cloud Engineering</strong> with nearly two decades of technology
                  leadership experience. Currently navigating the shift from executor to strategist at
                  the intersection of organizational leadership and agentic AI.
                </p>
                <p>
                  Tech Lead Shift is not academic research. It is practitioner observation. Every
                  article starts with something real that happened during a week of leading technology
                  teams, and pulls back to the pattern it reveals.
                </p>
                <p>
                  The central question driving this series: what do leaders actually need to know to
                  manage a workforce where some workers are human and some are not?
                </p>
                <p>Writing about leadership, AI, and the humans caught in between.</p>
              </div>
            </div>
            <div className="about-stats">
              <div className="stat-item">
                <div className="stat-number">18+</div>
                <div className="stat-label">Years of technology leadership</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">10</div>
                <div className="stat-label">Article research series in progress</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">Wed</div>
                <div className="stat-label">New articles every four weeks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERIES */}
      <section id="series">
        <div className="container-wide">
          <div className="section-label">The Series</div>
          <div className="series-intro">
            <h2 className="section-headline">Ten articles. One argument.</h2>
            <p>
              A structured examination of why current leadership frameworks fail hybrid
              human-AI teams, and what the alternative requires.
            </p>
          </div>

          <div className="series-grid">
            <div className="series-act">
              <div className="act-header">
                <div className="act-label">Act I — Articles 1–6</div>
                <div className="act-title">The Diagnosis</div>
              </div>
              <ul className="act-articles">
                <li>
                  <span className="article-num">01</span>
                  The first AI leadership crisis will be cultural, not technical
                  <span className="article-status">Live</span>
                </li>
                <li>
                  <span className="article-num">02</span>
                  Managing the invisible worker
                  <span className="article-status">Live</span>
                </li>
                <li>
                  <span className="article-num">03</span>
                  Delegation drift
                  <span className="article-status">Scheduled</span>
                </li>
                <li>
                  <span className="article-num">04</span>
                  Why AI will expose bad management faster than ever
                  <span className="article-status">Scheduled</span>
                </li>
                <li>
                  <span className="article-num">05</span>
                  The new leadership skill: systems thinking
                </li>
                <li>
                  <span className="article-num">06</span>
                  The end of productivity theater
                </li>
              </ul>
            </div>

            <div className="series-act">
              <div className="act-header">
                <div className="act-label">Act II — Articles 7–10</div>
                <div className="act-title">The Transformation</div>
              </div>
              <ul className="act-articles">
                <li>
                  <span className="article-num">07</span>
                  Middle management in the age of AI
                </li>
                <li>
                  <span className="article-num">08</span>
                  Why culture matters more when machines work for you
                </li>
                <li>
                  <span className="article-num">09</span>
                  The accountability problem no one is ready for
                </li>
                <li>
                  <span className="article-num">10</span>
                  The future leader is a system architect
                </li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <a
              href="https://techleadshift.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Read on Substack
            </a>
          </div>
        </div>
      </section>

      {/* NEWSLETTER + SPEAKING */}
      <section id="newsletter">
        <div className="container">
          <div className="newsletter-inner">
            <div className="newsletter-body">
              <div className="section-label">Subscribe</div>
              <h2 className="section-headline">New articles, every four weeks.</h2>
              <p>
                Published Wednesday mornings on Substack. No filler content, no weekly digests.
                One article when there is something worth saying.
              </p>
              <p>
                Subscribe directly on Substack and you will also get access to Notes, shorter
                observations from the week that do not make it into articles.
              </p>
              <div style={{ marginTop: "2rem" }}>
                <a
                  href="https://techleadshift.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Subscribe on Substack
                </a>
              </div>
            </div>
            <div>
              <div className="section-label">Speaking &amp; Consulting</div>
              <h2 className="section-headline" style={{ fontSize: "1.75rem" }}>Work with Charles</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact">
        <div className="container">
          <div className="contact-grid">
            <div>
              <div className="section-label">Contact</div>
              <h2 className="section-headline">Let&apos;s talk.</h2>
              <div className="contact-body">
                <p>
                  If you are leading technology teams through AI adoption and something in this
                  series resonated, I would like to hear from you. The research gets better when
                  practitioners share what they are seeing.
                </p>
              </div>
              <div className="contact-items">
                <a
                  href="https://techleadshift.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-item"
                >
                  <div className="contact-icon">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
                    </svg>
                  </div>
                  Read on Substack
                </a>
                <a
                  href="https://linkedin.com/in/charlesbetancourt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-item"
                >
                  <div className="contact-icon">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  Connect on LinkedIn
                </a>
              </div>
            </div>
            <div style={{ paddingTop: "4rem" }}>
              <blockquote
                style={{
                  borderLeft: "2px solid var(--gold)",
                  paddingLeft: "1.5rem",
                  margin: 0,
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.25rem",
                    fontStyle: "italic",
                    color: "var(--ink)",
                    lineHeight: 1.5,
                    marginBottom: "1rem",
                  }}
                >
                  &ldquo;You don&apos;t lead machines with presence. You lead them with parameters.&rdquo;
                </p>
                <cite
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ink-faint)",
                    fontStyle: "normal",
                  }}
                >
                  Charles Betancourt
                </cite>
              </blockquote>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
