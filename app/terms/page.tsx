import Link from "next/link";
import type { Metadata } from "next";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "jmpseat. | Terms",
  description: "Plain-language waitlist terms for the jmpseat preview page.",
};

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.backLink}>
          ← Back to waitlist
        </Link>

        <article className={styles.card}>
          <p className={styles.eyebrow}>waitlist terms</p>
          <h1 className={styles.title}>Terms</h1>
          <p className={styles.lede}>
            These plain-language terms apply to the public jmpseat. waitlist
            page during the preview phase.
          </p>
          <p className={styles.effective}>Effective date: [Add launch date]</p>

          <section className={styles.section}>
            <h2>Current status</h2>
            <p>jmpseat. is currently an early waitlist and preview page.</p>
          </section>

          <section className={styles.section}>
            <h2>No guarantee of access</h2>
            <p>
              Joining the waitlist does not guarantee access, timing, or
              admission into beta.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Accurate information</h2>
            <p>
              If you submit the waitlist form, you must provide accurate
              information.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Submission limits</h2>
            <p>
              You may not submit unlawful, abusive, misleading, or third-party
              information.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Changes to the waitlist</h2>
            <p>
              jmpseat. may change, pause, or discontinue the waitlist or product
              plans at any time.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Independence</h2>
            <p>
              jmpseat. is independent and not affiliated with any airline,
              airport, union, or employer.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Prohibited information</h2>
            <p>
              jmpseat. does not permit or encourage sharing passenger data, crew
              tracking, exact crew hotel information, trip screenshots,
              employer-confidential information, or aviation/security-sensitive
              operational information.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Contact</h2>
            <p>
              Questions about the waitlist can be sent to{" "}
              <a className={styles.contact} href="mailto:support@jmpseat.com">
                support@jmpseat.com
              </a>
              .
            </p>
          </section>

          <p className={styles.note}>
            Confirm that the final jmpseat domain email inboxes are configured
            before public launch. If the business contact addresses change,
            update this page and the public footer links before launch.
          </p>
        </article>
      </div>
    </main>
  );
}
