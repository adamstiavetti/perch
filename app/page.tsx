import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import styles from "./page.module.css";

const WAITLIST_FORM_URL =
  process.env.NEXT_PUBLIC_WAITLIST_FORM_URL?.trim() || "https://tally.so/r/jav6aa";

const TRUST_ITEMS = [
  "verified workers",
  "private by design",
  "built for airline life",
] as const;

const BETA_ACCESS_HREF = "/login?next=/app";

const FEATURE_CARDS = [
  {
    label: "base",
    title: "Base Boards",
    copy: "Trusted base intel for reserve life, new hires, parking, transit, food, errands, and how your base actually works.",
    image: "/jmpseat/base-boards-v2.png",
    imageAlt:
      "Crew members rolling luggage through an airport base parking and shuttle area at blue hour.",
  },
  {
    label: "layover",
    title: "Layover Boards",
    copy: "Trusted layover intel for food, transportation, downtime, and airport-area know-how.",
    image: "/jmpseat/layover-boards-v2.png",
    imageAlt:
      "A late-night airport-district street with a restaurant, traffic, and a traveler pulling luggage.",
  },
  {
    label: "rooms",
    title: "Verified Rooms",
    copy: "Verified discussion spaces for airline life, organized by base and topic.",
    image: "/jmpseat/verified-rooms-v2.png",
    imageAlt:
      "A dim private lounge with conversational seating and warm low lighting.",
  },
  {
    label: "verified",
    title: "Verified Entry",
    copy: "Invite-only beta access for verified airline workers.",
    image: "/jmpseat/verified-access-v2.png",
    imageAlt:
      "Travel documents and access materials arranged on a dark tray in warm light.",
  },
] as const;

export const metadata: Metadata = {
  title: "jmpseat. | Private waitlist",
  description:
    "jmpseat. is the off-duty network for airline workers, built for trusted base intel, layover knowledge, and verified discussion.",
};

function WaitlistCta() {
  return (
    <a
      className={`${styles.submitButton} ${styles.ctaLink}`}
      href={WAITLIST_FORM_URL}
    >
      join waitlist
    </a>
  );
}

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <Image
          src="/jmpseat/hero-runway.png"
          alt=""
          fill
          priority
          className={styles.heroImage}
          sizes="100vw"
        />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroShell}>
          <header className={styles.header}>
            <a className={styles.wordmark} href="#top" aria-label="jmpseat. home">
              jmpseat.
            </a>
            <Link className={styles.betaAccessLink} href={BETA_ACCESS_HREF}>
              Beta Access
            </Link>
          </header>

          <div id="top" className={styles.heroContent}>
            <div className={styles.copyColumn}>
              <h1 id="hero-title" className={styles.headline}>
                <span>the off-duty</span>
                <span>network for</span>
                <span className={styles.headlineAccent}>airline life.</span>
              </h1>
              <div className={styles.supportingCopy}>
                <p>Trusted base intel and layover knowledge for airline life.</p>
                <p>Verified privately. Private by design.</p>
                <p>Built for life between trips.</p>
              </div>

              <ul className={styles.trustRow} aria-label="Trust highlights">
                {TRUST_ITEMS.map((item) => (
                  <li key={item} className={styles.trustChip}>
                    {item}
                  </li>
                ))}
              </ul>

              <div className={styles.formBlock}>
                <WaitlistCta />
                <p id="hero-helper" className={styles.helperText}>
                  Early access for verified airline workers. No badges or IDs here.
                </p>
                <p className={styles.consentText}>
                  By joining the waitlist, you agree to receive jmpseat updates
                  about early access. We&apos;ll use your email only for
                  waitlist and product updates. Unsubscribe anytime. See our{" "}
                  <Link href="/privacy">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.contentShell}>
        <div className={styles.sectionDivider}>
          <span />
          <p>BUILT FOR LIFE BETWEEN TRIPS</p>
          <span />
        </div>

        <section className={styles.featureGrid} aria-label="Core product surfaces">
          {FEATURE_CARDS.map((card) => (
            <article key={card.title} className={styles.featureCard}>
              <div className={styles.featureMedia}>
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  className={styles.featureImage}
                  sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 25vw"
                />
                <div className={styles.featureMediaOverlay} aria-hidden="true" />
                <span className={styles.featureLabel}>{card.label}</span>
              </div>
              <div className={styles.featureBody}>
                <h2>{card.title}</h2>
                <p>{card.copy}</p>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.privacyPanel} aria-labelledby="privacy-title">
          <div>
            <p className={styles.privacyEyebrow}>private by design</p>
            <h2 id="privacy-title">We protect your privacy.</h2>
          </div>
          <p className={styles.privacyCopy}>
            Verified privately. Anonymous publicly. Built to keep passenger,
            hotel, and sensitive information out.
          </p>
        </section>

        <section className={styles.bottomCta} aria-labelledby="bottom-cta-title">
          <div className={styles.bottomCtaCopy}>
            <p className={styles.bottomCtaEyebrow}>private beta waitlist</p>
            <h2 id="bottom-cta-title">Join the private beta waitlist.</h2>
            <p>
              Get early access to trusted base intel, layover knowledge, and
              verified discussion for airline life.
            </p>
          </div>
          <div className={styles.formBlock}>
            <WaitlistCta />
            <p id="footer-helper" className={styles.helperText}>
              Early access for verified airline workers. Verification happens later through a separate private process.
            </p>
            <p className={styles.consentText}>
              By joining the waitlist, you agree to receive jmpseat updates
              about early access. We&apos;ll use your email only for waitlist
              and product updates. Unsubscribe anytime. See our{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </section>

        <footer className={styles.footer}>
          <span className={styles.footerBrand}>jmpseat.</span>
          <span className={styles.footerMeta}>
            crew knowledge. private community. off-duty.
          </span>
          <nav className={styles.footerLinks} aria-label="Footer links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href="mailto:contact@jmpseat.com">Contact</a>
          </nav>
          <p className={styles.footerDisclaimer}>
            Independent. Not affiliated with any airline, airport, union, or
            employer.
          </p>
        </footer>
      </section>
    </main>
  );
}
