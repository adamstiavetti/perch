import Image from "next/image";
import Link from "next/link";

import { PasswordInput } from "../../src/components/auth/PasswordInput";
import styles from "../../src/components/auth/auth.module.css";
import { signInAction } from "../../src/lib/auth/actions";
import { AUTH_ROUTES } from "../../src/lib/auth/routes";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const AUTH_ACCESSIBILITY_NOTE =
  "Airline employee email verification is required for closed beta private access.";

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.loginFieldIcon}>
      <path d="M4 6.5h16v11H4z" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.loginInfoIcon}>
      <path d="M12 3.2 19.5 6v5.6c0 4.4-2.6 8.2-7.5 10.6-4.9-2.4-7.5-6.2-7.5-10.6V6z" />
      <path d="m8.8 12.1 2.2 2.2 4.4-5.1" />
    </svg>
  );
}

function LockInfoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.loginInfoIcon}>
      <path d="M7 10V7.6a5 5 0 0 1 10 0V10" />
      <path d="M5.5 10h13v10h-13z" />
      <path d="M12 14v2.4" />
    </svg>
  );
}

function SecurityNoteIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className={styles.loginSecurityIcon}>
      <path d="M5 8V5.8a4 4 0 0 1 8 0V8" />
      <path d="M3.7 8h10.6v7.2H3.7z" />
      <path d="M9 10.5v2" />
    </svg>
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = getValue(params.error);
  const message = getValue(params.message);
  const next = getValue(params.next) ?? AUTH_ROUTES.app;

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginShell} aria-labelledby="login-title">
        <Image
          src="/images/auth/jmpseat-auth-hero-mobile.webp"
          alt=""
          fill
          priority
          className={styles.loginHeroMobileImage}
          sizes="(max-width: 760px) 100vw, 1px"
        />
        <div className={styles.loginStory}>
          <div className={styles.loginBrandBlock}>
            <Link className={styles.loginWordmark} href="/" aria-label="jmpseat home">
              jmpseat<span>.</span>
            </Link>
          </div>

          <div className={styles.loginCopy}>
            <p className={styles.loginEyebrow}>PRIVATE BETA</p>
            <h1 id="login-title" className={styles.loginTitle}>
              Access jmpseat private beta
            </h1>
            <div className={styles.loginDivider} aria-hidden="true">
              <span />
              <span>✈</span>
              <span />
            </div>
            <p className={styles.loginLead}>
              Sign in or create your account to continue.
            </p>
            <p className={styles.loginDescription}>
              Private beta access requires an approved airline employee email and
              may require an invite code.
            </p>
          </div>

          <div className={styles.loginImagePanel} aria-hidden="true">
            <Image
              src="/images/auth/jmpseat-auth-hero-desktop.webp"
              alt=""
              fill
              priority
              className={styles.loginImage}
              sizes="(min-width: 761px) 50vw, 1px"
            />
          </div>
        </div>

        <div className={styles.loginFormPanel}>
          <div className={styles.loginMobileNotes} aria-label="Private beta access notes">
            <p>
              <ShieldIcon />
              <span>Sign in or create your account to continue.</span>
            </p>
            <p>
              <LockInfoIcon />
              <span>
                Private beta access requires an approved airline employee email
                and may require an invite code.
              </span>
            </p>
          </div>

          {error ? (
            <p className={styles.loginError} role="alert">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className={styles.loginMessage} role="status">
              {message}
            </p>
          ) : null}

          <form className={styles.loginForm} action={signInAction}>
            <input type="hidden" name="next" value={next} />
            <div className={styles.loginField}>
              <label className={styles.loginLabel} htmlFor="email">
                Email
              </label>
              <div className={styles.loginInputShell}>
                <MailIcon />
                <input
                  className={styles.loginInput}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@airline.com"
                  required
                />
              </div>
            </div>

            <div className={styles.loginField}>
              <label className={styles.loginLabel} htmlFor="password">
                Password
              </label>
              <PasswordInput />
            </div>

            <button className={styles.loginButton} type="submit">
              <span>Sign in</span>
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <nav className={styles.loginLinks} aria-label="Account links">
            <Link href={AUTH_ROUTES.resetPassword}>Forgot password?</Link>
          </nav>

          <div className={styles.loginOrDivider} aria-hidden="true">
            <span />
            <span>OR</span>
            <span />
          </div>

          <Link className={styles.loginCreateButton} href={AUTH_ROUTES.signup}>
            <span>Create an account</span>
            <span aria-hidden="true">→</span>
          </Link>

          <p className={styles.loginSecurityNote}>
            <SecurityNoteIcon />
            Private community for verified aviation professionals.
            <span className={styles.loginSrOnly}>{AUTH_ACCESSIBILITY_NOTE}</span>
          </p>
        </div>
      </section>
    </main>
  );
}
