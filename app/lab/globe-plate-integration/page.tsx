import styles from "./page.module.css";

const routeArcs = [
  "M89 247 C200 64 453 64 580 205",
  "M57 302 C236 399 460 390 630 270",
  "M141 182 C318 300 440 336 564 420",
  "M486 100 C645 133 713 262 617 395",
];

const aircraft = [
  { className: styles.aircraftOne, label: "A1" },
  { className: styles.aircraftTwo, label: "A2" },
  { className: styles.aircraftThree, label: "A3" },
  { className: styles.aircraftFour, label: "A4" },
];

export default function GlobePlateIntegrationPage() {
  return <GlobePlateIntegrationLab />;
}

function GlobePlateIntegrationLab() {
  return (
    <main className={styles.page} aria-labelledby="plate-lab-title">
      <section className={styles.stage}>
        <div className={styles.scene}>
          <PlateHero />
          <ScannerTicketScaffold />
        </div>

        <aside className={styles.notes} aria-labelledby="plate-lab-title">
          <p className={styles.kicker}>Lab only</p>
          <h1 id="plate-lab-title">Globe plate integration</h1>
          <p>
            Static art-directed globe plate with live route and aircraft overlay layers. Scanner,
            ticket, and CTA remain scaffolded for composition only.
          </p>
          <dl>
            <div>
              <dt>Plate paths</dt>
              <dd>/cinematic/plates/globe-mobile.png</dd>
              <dd>/cinematic/plates/globe-desktop.png</dd>
              <dd>/cinematic/plates/globe-only.png</dd>
            </div>
            <div>
              <dt>Not final</dt>
              <dd>Duplicated placeholder plates, overlay timing, scanner/ticket art.</dd>
            </div>
            <div>
              <dt>Future motion</dt>
              <dd>Scan, absorb, launch, reconstruct, and scroll chapters.</dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}

function PlateHero() {
  return (
    <div className={styles.globeHero} aria-label="Art-directed globe plate with live route overlays">
      <picture>
        <source media="(min-width: 760px)" srcSet="/cinematic/plates/globe-desktop.png" />
        <img
          className={styles.globePlate}
          src="/cinematic/plates/globe-mobile.png"
          alt="Art-directed cinematic Earth plate placeholder"
        />
      </picture>
      <LiveRouteOverlay />
      <AircraftMarkers />
      <div className={styles.plateStatus}>placeholder plate</div>
    </div>
  );
}

function LiveRouteOverlay() {
  return (
    <svg className={styles.routeOverlay} viewBox="0 0 720 520" aria-hidden="true">
      {routeArcs.map((arc, index) => (
        <path className={styles.routeArc} d={arc} key={arc} style={{ animationDelay: `${index * 0.45}s` }} />
      ))}
    </svg>
  );
}

function AircraftMarkers() {
  return (
    <div className={styles.aircraftLayer} aria-hidden="true">
      {aircraft.map((marker) => (
        <span className={`${styles.aircraftMarker} ${marker.className}`} key={marker.label}>
          <PlaneIcon />
        </span>
      ))}
    </div>
  );
}

function PlaneIcon() {
  return (
    <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true">
      <path d="M58 30 37 36 25 58l-5-3 6-19-18-5 3-5 18 1 8-20 5 2-3 19 19-3z" />
    </svg>
  );
}

function ScannerTicketScaffold() {
  return (
    <div className={styles.scaffold} aria-label="Scanner and ticket scaffold">
      <div className={styles.scanner}>
        <span className={styles.slot} />
        <span className={styles.lightLeft} />
        <span className={styles.lightRight} />
      </div>
      <article className={styles.ticket}>
        <div className={styles.ticketMeta}>
          <span>
            <small>Passenger</small>
            Aviation Worker
          </span>
          <span>
            <small>Flight</small>
            AWC-2026
          </span>
        </div>
        <div className={styles.route}>
          <strong>JFK</strong>
          <span>to</span>
          <strong>CDG</strong>
        </div>
        <button className={styles.enterCta} type="button" aria-label="Enter waitlist lab placeholder">
          Enter
        </button>
      </article>
    </div>
  );
}
