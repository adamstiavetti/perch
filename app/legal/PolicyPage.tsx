import Link from "next/link";

import styles from "../legal.module.css";

export type PolicyPageSection = {
  title: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
};

type PolicyPageProps = {
  eyebrow: string;
  title: string;
  lede: string;
  sections: readonly PolicyPageSection[];
};

const RELATED_LINKS = [
  { href: "/legal/beta-terms", label: "Private Beta Terms" },
  { href: "/legal/privacy", label: "Privacy Notice" },
  { href: "/legal/community-rules", label: "Community Rules" },
  { href: "/legal/verification-privacy", label: "Verification & Privacy" },
  { href: "/legal/moderation-appeals", label: "Moderation & Appeals" },
  { href: "/legal/support-requests", label: "Support & Requests" },
] as const;

export function PolicyPage({
  eyebrow,
  title,
  lede,
  sections,
}: PolicyPageProps) {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.backLink}>
          &larr; Back to waitlist
        </Link>

        <article className={styles.card}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.lede}>{lede}</p>
          <p className={styles.effective}>
            Private beta draft. Last updated: June 14, 2026.
          </p>
          <p className={styles.note}>
            This page is practical private-beta copy for jmpseat. It is not
            legal advice, not final legal terms, and still needs founder/legal
            review before broad launch.
          </p>

          {sections.map((section) => (
            <section className={styles.section} key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.items ? (
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <nav className={styles.relatedLinks} aria-label="Private beta policy pages">
            {RELATED_LINKS.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </article>
      </div>
    </main>
  );
}
