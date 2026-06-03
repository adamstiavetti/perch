import styles from "./page.module.css";
import {
  PRIVATE_SHELL_MESSAGE,
  PRIVATE_SHELL_NAV_ITEMS,
} from "../../src/lib/privateApp/privateShellPlaceholder";

export default function AppPlaceholder() {
  return (
    <main className={styles.shell}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.brandBlock}>
            <p className={styles.brand}>Skybyrd</p>
            <span className={styles.subbrand}>Private app shell placeholder</span>
          </div>
          <div className={styles.statusPill}>Locked Placeholder</div>
        </header>

        <section className={styles.panel} aria-labelledby="private-beta-title">
          <div className={styles.contentGrid}>
            <nav
              className={styles.nav}
              aria-label="Future private app sections"
            >
              <ul className={styles.navList}>
                {PRIVATE_SHELL_NAV_ITEMS.map((item) => (
                  <li key={item.label} className={styles.navCard}>
                    <span className={styles.navCardLabel}>{item.label}</span>
                    <span className={styles.navCardMeta}>{item.description}</span>
                    <span className={styles.disabledTag} aria-hidden="true">
                      Coming later
                    </span>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.main}>
              <p className={styles.eyebrow}>{PRIVATE_SHELL_MESSAGE.eyebrow}</p>
              <h1 id="private-beta-title" className={styles.title}>
                {PRIVATE_SHELL_MESSAGE.title}
              </h1>
              <p className={styles.lede}>{PRIVATE_SHELL_MESSAGE.description}</p>
              <p className={styles.detail}>{PRIVATE_SHELL_MESSAGE.detail}</p>
              <div className={styles.callout}>
                {PRIVATE_SHELL_MESSAGE.disclaimer}
              </div>
            </div>
          </div>

          <footer className={styles.footer}>
            <span>Public waitlist access stays on the marketing entry route.</span>
            <span>
              Real login, verification, and beta-access gates belong to later
              epochs.
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}
