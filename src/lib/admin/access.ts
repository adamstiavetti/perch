export const ADMIN_ROUTES = {
  home: "/app/admin",
  verification: "/app/admin/verification",
  approvedDomains: "/app/admin/approved-domains",
  reviewerScopes: "/app/admin/reviewer-scopes",
  auditInspection: "/app/admin/audit",
  proofCleanup: "/app/admin/proof-cleanup",
} as const;

export const OPERATOR_GRANT_IMPLEMENTATION_STATUS = "not_implemented" as const;

export type AdminNavigationItem = {
  key:
    | "verification_review"
    | "approved_domains"
    | "reviewer_scopes"
    | "audit_inspection"
    | "proof_cleanup";
  label: string;
  path: string;
  description: string;
  status: "available" | "disabled";
  availabilityLabel: string;
  reason: string;
};

function buildOperatorUnavailableItem(input: {
  key: AdminNavigationItem["key"];
  label: string;
  path: string;
  description: string;
}): AdminNavigationItem {
  return {
    ...input,
    status: "disabled",
    availabilityLabel: "Unavailable",
    reason:
      "Operator grants are not implemented yet, so this operator-only section stays unavailable by default.",
  };
}

export function buildAdminNavigation(input: { reviewerAuthorized: boolean }) {
  const verificationReviewItem: AdminNavigationItem = input.reviewerAuthorized
    ? {
        key: "verification_review",
        label: "Verification Review",
        path: ADMIN_ROUTES.verification,
        description: "Existing reviewer queue for bounded verification decisions.",
        status: "available",
        availabilityLabel: "Available now",
        reason:
          "Available through the existing reviewer-scope authorization path only.",
      }
    : {
        key: "verification_review",
        label: "Verification Review",
        path: ADMIN_ROUTES.verification,
        description: "Existing reviewer queue for bounded verification decisions.",
        status: "disabled",
        availabilityLabel: "Requires reviewer scope",
        reason:
          "Reviewer access remains separate from operator access and requires an active reviewer scope.",
      };

  return [
    verificationReviewItem,
    buildOperatorUnavailableItem({
      key: "approved_domains",
      label: "Approved Domains",
      path: ADMIN_ROUTES.approvedDomains,
      description: "Future operator management for approved work-email domains.",
    }),
    buildOperatorUnavailableItem({
      key: "reviewer_scopes",
      label: "Reviewer Scopes",
      path: ADMIN_ROUTES.reviewerScopes,
      description: "Future operator management for reviewer-scope grants and revocations.",
    }),
    buildOperatorUnavailableItem({
      key: "audit_inspection",
      label: "Audit Inspection",
      path: ADMIN_ROUTES.auditInspection,
      description: "Future metadata-only inspection of verification and security events.",
    }),
    buildOperatorUnavailableItem({
      key: "proof_cleanup",
      label: "Proof Cleanup",
      path: ADMIN_ROUTES.proofCleanup,
      description: "Future monitoring and bounded manual control for proof cleanup.",
    }),
  ] as const;
}
