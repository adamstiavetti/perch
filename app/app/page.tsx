import Link from "next/link";

export default function PrivateBetaPlaceholder() {
  return (
    <main className="private-shell">
      <section className="private-card" aria-labelledby="private-title">
        <p className="terminal-label">PRIVATE BETA / ACCESS HOLD</p>
        <h1 id="private-title">Private beta access required</h1>
        <p>Deadhead Club is not open yet.</p>
        <Link className="button button-primary" href="/">
          Back to splash page
        </Link>
      </section>
    </main>
  );
}
