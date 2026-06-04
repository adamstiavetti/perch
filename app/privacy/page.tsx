import Link from "next/link";
import type { Metadata } from "next";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "jmpseat. | Privacy",
  description: "Plain-language privacy policy for the jmpseat waitlist.",
};

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.backLink}>
          ← Back to waitlist
        </Link>

        <article className={styles.card}>
          <p className={styles.eyebrow}>waitlist privacy</p>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.lede}>
            This page explains how jmpseat. handles information collected
            through the public waitlist.
          </p>
          <p className={styles.effective}>Effective date: [Add launch date]</p>

          <section className={styles.section}>
            <h2>What we collect</h2>
            <p>
              jmpseat. collects email addresses submitted through the waitlist.
            </p>
            <p>
              jmpseat. may later collect optional role, base, or
              airline-interest information if you choose to provide it.
            </p>
          </section>

          <section className={styles.section}>
            <h2>How we use it</h2>
            <p>
              We use waitlist information for waitlist management, early access
              updates, product research, and launch communications.
            </p>
          </section>

          <section className={styles.section}>
            <h2>What we do not do</h2>
            <p>jmpseat. does not sell personal information.</p>
          </section>

          <section className={styles.section}>
            <h2>Service providers</h2>
            <p>
              jmpseat. may use service providers such as form, hosting, or
              email tools to operate the waitlist.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Your choices</h2>
            <p>
              You can request deletion or unsubscribe at any time by contacting{" "}
              <a className={styles.contact} href="mailto:privacy@jmpseat.com">
                privacy@jmpseat.com
              </a>
              .
            </p>
          </section>

          <section className={styles.section}>
            <h2>Age requirement</h2>
            <p>jmpseat. is intended for users 18 and older.</p>
          </section>

          <section className={styles.section}>
            <h2>Independence</h2>
            <p>
              jmpseat. is independent and not affiliated with any airline,
              airport, union, or employer.
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
