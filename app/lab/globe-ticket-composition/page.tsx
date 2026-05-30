import styles from "./page.module.css";

const ticketMeta = [
  { label: "Passenger", value: "Aviation Worker" },
  { label: "Date", value: "24 May 2026" },
  { label: "Flight", value: "DHC-2026" },
];

const ticketDetails = [
  { label: "Gate", value: "A24" },
  { label: "Boarding", value: "19:30" },
  { label: "Seat", value: "24A" },
  { label: "Group", value: "A" },
];

export default function GlobeTicketCompositionPage() {
  return (
    <main className={styles.page} aria-label="Globe ticket composition lab">
      <section className={styles.scene} aria-label="Static globe ticket composition">
        <div className={styles.sky} aria-hidden="true">
          <span className={styles.starOne} />
          <span className={styles.starTwo} />
          <span className={styles.starThree} />
          <span className={styles.starFour} />
        </div>

        <div className={styles.globeGroup} aria-hidden="true">
          <div className={styles.globeHalo} />
          <div className={styles.globe}>
            <span className={styles.cityLights} />
            <span className={styles.horizonGlow} />
            <span className={styles.atmosphere} />
          </div>

          <svg className={styles.routes} viewBox="0 0 640 640" role="img" aria-label="Illustrative aviation route arcs">
            <defs>
              <filter id="routeGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="planeGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="2.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <ellipse className={styles.routeBlue} cx="320" cy="320" rx="330" ry="128" transform="rotate(-12 320 320)" />
            <ellipse className={styles.routeAmber} cx="320" cy="320" rx="324" ry="116" transform="rotate(43 320 320)" />
            <ellipse className={styles.routeBlueThin} cx="320" cy="320" rx="344" ry="154" transform="rotate(72 320 320)" />
            <path className={styles.routeBlueSoft} d="M18 356 C150 168 454 92 622 244" />
            <path className={styles.routeAmberThin} d="M52 214 C188 368 432 444 610 374" />
            <path className={styles.routeBlueThin} d="M100 540 C150 320 382 150 610 126" />
            <g className={styles.plane} transform="translate(142 196) rotate(23)">
              <path d="M0 -22 C3 -17 4 -10 4 -4 L30 6 C32 7 32 10 29 11 L5 9 L3 26 L0 31 L-3 26 L-5 9 L-29 11 C-32 10 -32 7 -30 6 L-4 -4 C-4 -10 -3 -17 0 -22 Z" />
            </g>
            <g className={styles.plane} transform="translate(342 214) rotate(88) scale(1.12)">
              <path d="M0 -22 C3 -17 4 -10 4 -4 L30 6 C32 7 32 10 29 11 L5 9 L3 26 L0 31 L-3 26 L-5 9 L-29 11 C-32 10 -32 7 -30 6 L-4 -4 C-4 -10 -3 -17 0 -22 Z" />
            </g>
            <g className={styles.planeAmber} transform="translate(505 420) rotate(44) scale(.96)">
              <path d="M0 -22 C3 -17 4 -10 4 -4 L30 6 C32 7 32 10 29 11 L5 9 L3 26 L0 31 L-3 26 L-5 9 L-29 11 C-32 10 -32 7 -30 6 L-4 -4 C-4 -10 -3 -17 0 -22 Z" />
            </g>
            <g className={styles.plane} transform="translate(96 472) rotate(-42) scale(.82)">
              <path d="M0 -22 C3 -17 4 -10 4 -4 L30 6 C32 7 32 10 29 11 L5 9 L3 26 L0 31 L-3 26 L-5 9 L-29 11 C-32 10 -32 7 -30 6 L-4 -4 C-4 -10 -3 -17 0 -22 Z" />
            </g>
            <g className={styles.plane} transform="translate(566 190) rotate(58) scale(.74)">
              <path d="M0 -22 C3 -17 4 -10 4 -4 L30 6 C32 7 32 10 29 11 L5 9 L3 26 L0 31 L-3 26 L-5 9 L-29 11 C-32 10 -32 7 -30 6 L-4 -4 C-4 -10 -3 -17 0 -22 Z" />
            </g>
          </svg>
        </div>

        <div className={styles.deviceStack}>
          <div className={styles.printer} aria-hidden="true">
            <span className={styles.printerTop} />
            <span className={styles.slotLightLeft} />
            <span className={styles.slotLightRight} />
            <span className={styles.slot} />
          </div>

          <article className={styles.ticket} aria-label="Boarding pass invitation">
            <div className={`${styles.ticketGrid} ${styles.ticketMeta}`}>
              {ticketMeta.map((row) => (
                <div className={styles.ticketCell} key={`${row.label}-${row.value}`}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>

            <div className={styles.routeCode}>
              <div>
                <span>From</span>
                <strong>JFK</strong>
                <small>New York</small>
              </div>
              <b aria-hidden="true">AIR</b>
              <div>
                <span>To</span>
                <strong>CDG</strong>
                <small>Paris</small>
              </div>
            </div>

            <div className={`${styles.ticketGrid} ${styles.ticketDetails}`}>
              {ticketDetails.map((row) => (
                <div className={styles.ticketCell} key={`${row.label}-${row.value}`}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>

            <p className={styles.welcome}>Welcome aboard the verified airline-worker network</p>
            <div className={styles.barcode} aria-hidden="true" />
            <a className={styles.cta} href="https://tally.so/r/jav6aa">
              Enter
            </a>
          </article>

          <span className={styles.mouthCover} aria-hidden="true" />
        </div>
      </section>
    </main>
  );
}
