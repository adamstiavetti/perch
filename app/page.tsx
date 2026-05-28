const waitlistFormUrl = process.env.NEXT_PUBLIC_WAITLIST_FORM_URL?.trim();

const problemCards = [
  {
    title: "Scattered across group chats",
    copy: "Useful answers disappear into private threads, screenshots, and one-off texts.",
  },
  {
    title: "Buried in Facebook groups",
    copy: "Base knowledge exists, but it is hard to search, verify, and keep current.",
  },
  {
    title: "Reddit threads are not built for us",
    copy: "Public forums can help, but aviation-worker context and safety boundaries vary.",
  },
  {
    title: "Word of mouth is not scalable",
    copy: "New hires, commuters, and role-switchers need institutional knowledge before they know who to ask.",
  },
];

const featureCards = [
  {
    title: "Base Boards",
    tag: "Core wedge",
    copy: "Base-specific intel, updates, bid info, and crew-to-crew knowledge.",
    featured: true,
  },
  {
    title: "Layover Boards",
    tag: "Core wedge",
    copy: "Layover tips, transportation, local recommendations, and crew-reviewed city intel.",
    featured: true,
  },
  {
    title: "Crew Rooms",
    tag: "Verified talk",
    copy: "Topic-based rooms for real conversations with fellow crew.",
  },
  {
    title: "Jumpseat Brief",
    tag: "AI-assisted",
    copy: "AI-assisted layover planning and crew-life reminders, grounded in community knowledge.",
  },
  {
    title: "Ready Room",
    tag: "Career utility",
    copy: "Career, interview, new-hire, and professional guidance for aviation workers.",
  },
  {
    title: "NonRev Deals",
    tag: "Supporting layer",
    copy: "Crew-friendly perks and discounts as a supporting layer, not the core wedge.",
  },
];

const verifiedItems = [
  "Right people",
  "Better info",
  "Safe conversations",
  "Accountable community",
];

const boundaryItems = [
  "No airline portal login",
  "No schedule scraping",
  "No public crew tracking",
  "No exact crew hotel exposure",
  "No badge uploads on the waitlist",
];

export default function Home() {
  return (
    <main>
      <header className="site-header" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Deadhead Club home">
          <span className="brand-mark" aria-hidden="true">
            DC
          </span>
          <span>
            <span className="brand-name">Deadhead Club</span>
            <span className="brand-kicker">Working name</span>
          </span>
        </a>
        <nav className="nav-links" aria-label="Landing page sections">
          <a href="#features">Features</a>
          <a href="#verified">Why Verified</a>
          <a href="#waitlist">Waitlist</a>
          <a href="#faq">FAQ</a>
        </nav>
        <span className="crew-badge">For verified aviation workers</span>
      </header>

      <section id="top" className="hero section-shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="terminal-label">TERMINAL DHC / GATE M1A / NOW BOARDING</p>
          <h1 id="hero-title">The off-duty network for airline people.</h1>
          <p className="hero-subtitle">
            Base intel, layover knowledge, and honest crew talk — built for
            verified aviation workers.
          </p>
          <div className="hero-actions" aria-label="Primary calls to action">
            <a className="button button-primary" href="#waitlist">
              Join the Waitlist
            </a>
            <a className="button button-secondary" href="#features">
              See the Vision
            </a>
          </div>
          <div className="route-strip" aria-label="Example route accents">
            <span>DAL → LAX</span>
            <span>ORD</span>
            <span>JFK</span>
            <span>CREW MODE</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Deadhead Club preview">
          <div className="route-arc" aria-hidden="true" />
          <article className="app-preview" aria-label="Mock Deadhead Club app preview">
            <div className="preview-header">
              <span>Welcome back, Crew.</span>
              <span className="status-pill">ACTIVE</span>
            </div>
            <div className="metric-grid">
              <div>
                <span className="metric-value">12</span>
                <span className="metric-label">active bases</span>
              </div>
              <div>
                <span className="metric-value">28</span>
                <span className="metric-label">layovers</span>
              </div>
              <div>
                <span className="metric-value">8</span>
                <span className="metric-label">crew rooms</span>
              </div>
            </div>
            <div className="activity-board">
              <p>RECENT ACTIVITY</p>
              <span>DFW base board: new-hire commute thread updated</span>
              <span>ORD layover board: late-night food list saved</span>
              <span>Ramp Talk: ops question flagged as answered</span>
            </div>
          </article>

          <article className="boarding-pass" aria-label="Boarding pass style preview card">
            <div>
              <span className="boarding-kicker">DEADHEAD CLUB</span>
              <h2>BOARDING PASS</h2>
            </div>
            <dl>
              <div>
                <dt>BASE</dt>
                <dd>YOU</dd>
              </div>
              <div>
                <dt>NEXT</dt>
                <dd>LAYOVER</dd>
              </div>
              <div>
                <dt>PRIORITY</dt>
                <dd>CREW</dd>
              </div>
              <div>
                <dt>BOARDING</dt>
                <dd>ANYTIME</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section className="trust-strip" aria-labelledby="trust-title">
        <h2 id="trust-title">Verified privately. Anonymous publicly. Accountable internally.</h2>
        <p>No airline portal login. No schedule scraping. No public nearby crew tracking.</p>
      </section>

      <section className="section-shell section-stack" aria-labelledby="problem-title">
        <div className="section-heading">
          <p className="terminal-label">FIELD REPORT / CREW PAIN</p>
          <h2 id="problem-title">Why crews need this</h2>
        </div>
        <div className="card-grid problem-grid">
          {problemCards.map((card) => (
            <article className="info-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="section-shell section-stack" aria-labelledby="features-title">
        <div className="section-heading">
          <p className="terminal-label">ARRIVALS / UTILITY FIRST</p>
          <h2 id="features-title">What you&apos;ll find inside Deadhead Club</h2>
        </div>
        <div className="card-grid feature-grid">
          {featureCards.map((feature) => (
            <article
              className={feature.featured ? "feature-card feature-card-featured" : "feature-card"}
              key={feature.title}
            >
              <span className="feature-tag">{feature.tag}</span>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="verified" className="section-shell split-section" aria-labelledby="verified-title">
        <div>
          <p className="terminal-label">SECURE AREA / WHY VERIFIED</p>
          <h2 id="verified-title">Why verified matters</h2>
          <p className="section-copy">
            Verified privately. Anonymous publicly. Accountable internally.
            Prove aviation affiliation behind the scenes, then participate
            with a handle or anonymous mode where room rules allow it.
          </p>
        </div>
        <div className="verified-list">
          {verifiedItems.map((item) => (
            <div className="verified-item" key={item}>
              <span aria-hidden="true" />
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell boundary-section" aria-labelledby="boundaries-title">
        <div className="section-heading">
          <p className="terminal-label">SAFETY BRIEF / PRIVACY BOUNDARIES</p>
          <h2 id="boundaries-title">Built with privacy boundaries</h2>
        </div>
        <ul className="boundary-list" aria-label="Privacy boundaries">
          {boundaryItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section id="waitlist" className="section-shell waitlist-section" aria-labelledby="waitlist-title">
        <div className="terminal-card">
          <p className="terminal-label">BOARDING GROUP / PRIVATE BETA</p>
          <h2 id="waitlist-title">Your next stop: better crew mode</h2>
          <p>Join the private beta waitlist and be first in.</p>
          {waitlistFormUrl ? (
            <a className="button button-primary" href={waitlistFormUrl}>
              Join the Private Beta Waitlist
            </a>
          ) : (
            <p className="waitlist-fallback" role="status">
              Waitlist form coming soon.
            </p>
          )}
        </div>
      </section>

      <section className="section-shell ambassador-card" aria-labelledby="ambassador-title">
        <div>
          <p className="terminal-label">GROUND CREW / FOUNDING HELP</p>
          <h2 id="ambassador-title">Help seed the first base community.</h2>
        </div>
        <p>
          Ambassadors get early access and help shape what Deadhead Club becomes.
        </p>
      </section>

      <section id="faq" className="section-shell faq-section" aria-labelledby="faq-title">
        <div className="section-heading">
          <p className="terminal-label">INFO DESK / FAQ</p>
          <h2 id="faq-title">Before boarding</h2>
        </div>
        <div className="faq-grid">
          <article>
            <h3>Is this an airline product?</h3>
            <p>No. Deadhead Club is not affiliated with or endorsed by any airline, airport, union, or employer.</p>
          </article>
          <article>
            <h3>Can I upload my badge here?</h3>
            <p>No. The public waitlist does not collect badge uploads, IDs, schedules, portal credentials, exact hotel details, or passenger information.</p>
          </article>
        </div>
      </section>

      <footer className="site-footer">
        <p>Not affiliated with or endorsed by any airline, airport, union, or employer.</p>
        <p>Working name pending legal/trademark clearance.</p>
      </footer>
    </main>
  );
}
