import Link from "next/link";
import type { ReactNode } from "react";

import type { AdminNavigationItem } from "../../lib/admin/access";
import styles from "./adminShell.module.css";

type AdminShellProps = {
  title: string;
  eyebrow: string;
  description: string;
  currentPath: string;
  navigation: readonly AdminNavigationItem[];
  error?: string;
  message?: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function AdminShell({
  title,
  eyebrow,
  description,
  currentPath,
  navigation,
  error,
  message,
  footer,
  children,
}: AdminShellProps) {
  return (
    <main className={styles.page}>
      <section className={styles.shell} aria-labelledby="admin-shell-title">
        <header className={styles.header}>
          <Link className={styles.wordmark} href="/">
            jmpseat.
          </Link>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id="admin-shell-title" className={styles.title}>
            {title}
          </h1>
          <p className={styles.description}>{description}</p>
        </header>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className={styles.message} role="status">
            {message}
          </p>
        ) : null}

        <div className={styles.content}>
          <aside className={styles.sidebar} aria-label="Admin navigation">
            <ul className={styles.navList}>
              {navigation.map((item) => {
                const isCurrent = item.path === currentPath;
                const itemClassName =
                  item.status === "available"
                    ? `${styles.navCard} ${isCurrent ? styles.navCardCurrent : ""}`.trim()
                    : `${styles.navCard} ${styles.navCardDisabled}`.trim();

                return (
                  <li key={item.path} className={itemClassName}>
                    <div className={styles.navHeader}>
                      {item.status === "available" ? (
                        <Link
                          className={styles.navLink}
                          href={item.path}
                          aria-current={isCurrent ? "page" : undefined}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className={styles.navLabel} aria-disabled="true">
                          {item.label}
                        </span>
                      )}
                      <span className={styles.badge}>{item.availabilityLabel}</span>
                    </div>
                    <p className={styles.navDescription}>{item.description}</p>
                    <p className={styles.navReason}>{item.reason}</p>
                  </li>
                );
              })}
            </ul>
          </aside>

          <article className={styles.mainContent}>{children}</article>
        </div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </section>
    </main>
  );
}
