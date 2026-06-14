import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthCard } from "../../../src/components/auth/AuthCard";
import styles from "../../../src/components/auth/auth.module.css";
import { getCurrentAppAccessContext } from "../../../src/lib/betaAccess/server";
import { getPrivateAppGateResult } from "../../../src/lib/privateApp/access";
import { acceptCurrentPrivateBetaPoliciesAction } from "../../../src/lib/policyAcceptance/actions";
import {
  POLICY_ACCEPTANCE_ROUTE,
  REQUIRED_POLICY_ACCEPTANCES,
  sanitizePolicyAcceptanceNextPath,
} from "../../../src/lib/policyAcceptance/policies";
import { getPolicyAcceptanceStatus } from "../../../src/lib/policyAcceptance/server";

export const dynamic = "force-dynamic";

type PolicyAcceptancePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getStatusMessage(status: string | null) {
  switch (status) {
    case "policy_acceptance_required":
      return "Review and accept the current private-beta policies before continuing.";
    case "policy_acceptance_failed":
      return "jmpseat could not record policy acceptance right now. Try again in a moment.";
    default:
      return null;
  }
}

export default async function PolicyAcceptancePage({
  searchParams,
}: PolicyAcceptancePageProps) {
  const params = await searchParams;
  const next = sanitizePolicyAcceptanceNextPath(getValue(params.next));
  const statusMessage = getStatusMessage(getValue(params.status) ?? null);
  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "policy-acceptance",
    nextPath: POLICY_ACCEPTANCE_ROUTE,
    context,
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  const acceptanceStatus = getPolicyAcceptanceStatus({
    records: context.policyAcceptanceRecords,
    loadError: context.policyAcceptanceLoadError,
  });

  if (acceptanceStatus.hasAcceptedAll) {
    redirect(next);
  }

  if (acceptanceStatus.loadError) {
    return (
      <AuthCard
        eyebrow="Private Beta Policies"
        title="Policy acceptance needs setup"
        description="Policy acceptance tracking is required before broader private-beta app entry."
        error={acceptanceStatus.loadError}
      >
        <p className={styles.hint}>
          This account still keeps the normal jmpseat auth, profile,
          beta-access, and airline-email gates. Policy acceptance cannot bypass
          those checks.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Private Beta Policies"
      title="Review current policies"
      description="Accept the current private beta terms, privacy notice, and community rules before entering the protected app."
      footer={
        <p className={styles.hint}>
          These pages are private-beta draft material for founder/legal review,
          not final legal terms or legal advice. Acceptance records app-entry
          acknowledgement only; it does not add support, deletion, appeal,
          proof-upload, AI decision, or comments/replies workflows.
        </p>
      }
    >
      {statusMessage ? (
        <p className={styles.loginError} role="alert">
          {statusMessage}
        </p>
      ) : null}

      <ul className={styles.hint}>
        {REQUIRED_POLICY_ACCEPTANCES.map((policy) => (
          <li key={policy.key}>
            <Link href={policy.href}>{policy.title}</Link>
          </li>
        ))}
      </ul>

      <form className={styles.loginForm} action={acceptCurrentPrivateBetaPoliciesAction}>
        <input type="hidden" name="next" value={next} />
        <label className={styles.hint}>
          <input
            name="policy_acknowledgement"
            type="checkbox"
            value="accepted"
            required
          />{" "}
          I have reviewed the current private beta terms, privacy notice, and
          community rules for jmpseat private beta.
        </label>

        <button className={styles.loginButton} type="submit">
          <span>Accept and continue</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>

      <p className={styles.hint}>
        Need more time? You can leave this page and return later. Public policy
        pages, login, signup, access hold, and restricted-access notices remain
        separate from this app-entry requirement.
      </p>
    </AuthCard>
  );
}
