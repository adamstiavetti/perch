import styles from "./privateShellPlaceholder.module.css";
import {
  PRIVATE_SHELL_NAV_ITEMS,
  type PrivateShellMessage,
} from "../../lib/privateApp/privateShellPlaceholder";

type PrivateShellPlaceholderProps = {
  message: PrivateShellMessage;
  currentPath?: string;
  subbrand?: string;
};

export function PrivateShellPlaceholder({
  message,
  currentPath,
  subbrand = "Private app shell placeholder",
}: PrivateShellPlaceholderProps) {
  return (
    <main className={styles.shell}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.brandBlock}>
            <p className={styles.brand}>Skybyrd</p>
            <span className={styles.subbrand}>{subbrand}</span>
          </div>
          <div className={styles.statusPill}>Locked Placeholder</div>
        </header>

        <section className={styles.panel} aria-labelledby="private-shell-title">
          <div className={styles.contentGrid}>
            <nav
              className={styles.nav}
              aria-label="Future private app sections"
            >
              <ul className={styles.navList}>
                {PRIVATE_SHELL_NAV_ITEMS.map((item) => {
                  const isCurrent = item.path === currentPath;

                  return (
                    <li
                      key={item.label}
                      className={`${styles.navCard}${isCurrent ? ` ${styles.navCardCurrent}` : ""}`}
                      aria-current={isCurrent ? "page" : undefined}
                    >
                      <span className={styles.navCardLabel}>{item.label}</span>
                      <span className={styles.navCardMeta}>{item.description}</span>
                      <span
                        className={`${styles.disabledTag}${isCurrent ? ` ${styles.currentTag}` : ""}`}
                        aria-label={
                          isCurrent
                            ? `${item.label} current placeholder route`
                            : `${item.label} coming later`
                        }
                      >
                        {isCurrent ? "Current placeholder" : "Coming later"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className={styles.main}>
              <p className={styles.eyebrow}>{message.eyebrow}</p>
              <h1 id="private-shell-title" className={styles.title}>
                {message.title}
              </h1>
              <p className={styles.lede}>{message.description}</p>
              <p className={styles.detail}>{message.detail}</p>
              <div className={styles.callout}>{message.disclaimer}</div>
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
