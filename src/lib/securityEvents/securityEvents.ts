export const SECURITY_EVENT_TYPES = [
  "auth.sign_in_attempt",
  "auth.sign_in_success",
  "auth.sign_in_failed",
  "auth.sign_up_attempt",
  "auth.sign_up_success",
  "auth.sign_up_failed",
  "auth.password_reset_requested",
  "auth.password_reset_request_failed",
  "auth.callback_resolved",
  "private_access.redirect_login",
  "private_access.redirect_profile",
  "private_access.redirect_access_hold",
  "private_access.allowed",
  "private_access.storage_not_ready",
  "profile.upsert_attempt",
  "profile.upsert_success",
  "profile.upsert_failed",
  "beta_access.checked",
] as const;

export type SecurityEventType = (typeof SECURITY_EVENT_TYPES)[number];

export type SecurityEventMetadata = Record<string, unknown>;
export type RecordSecurityEventInput = {
  userId?: string | null;
  eventType: SecurityEventType;
  route?: string | null;
  result?: string | null;
  metadata?: SecurityEventMetadata | null;
};

export type SecurityEventInsert = {
  user_id: string | null;
  event_type: SecurityEventType;
  route: string | null;
  result: string | null;
  metadata: Record<string, unknown>;
};

const REDACTED_METADATA_KEYS = new Set([
  "password",
  "email",
  "invited_email",
  "badge_id",
  "employee_id",
  "proof_type",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeValue(value: unknown): unknown {
  if (
    value == null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeValue(entry))
      .filter((entry) => entry != null);
  }

  if (isPlainObject(value)) {
    return sanitizeSecurityEventMetadata(value);
  }

  return String(value);
}

export function getEmailDomain(email: string | null | undefined) {
  const normalized = email?.trim().toLowerCase() ?? "";
  const atIndex = normalized.lastIndexOf("@");

  if (atIndex <= 0 || atIndex === normalized.length - 1) {
    return null;
  }

  return normalized.slice(atIndex + 1);
}

export function sanitizeSecurityEventMetadata(
  metadata: SecurityEventMetadata | null | undefined,
) {
  const sanitizedEntries = Object.entries(metadata ?? {}).flatMap(([key, value]) => {
    if (REDACTED_METADATA_KEYS.has(key) || value == null) {
      return [];
    }

    const sanitizedValue = sanitizeValue(value);

    if (sanitizedValue == null) {
      return [];
    }

    return [[key, sanitizedValue] as const];
  });

  return Object.fromEntries(sanitizedEntries);
}

export function getPrivateAccessEventType(
  gate:
    | { kind: "allow" }
    | {
        kind: "redirect";
        path: string;
      },
): SecurityEventType {
  if (gate.kind === "allow") {
    return "private_access.allowed";
  }

  if (gate.path.startsWith("/login")) {
    return "private_access.redirect_login";
  }

  if (gate.path.includes("error=")) {
    return "private_access.storage_not_ready";
  }

  if (gate.path.startsWith("/app/profile")) {
    return "private_access.redirect_profile";
  }

  return "private_access.redirect_access_hold";
}

export async function recordSecurityEventWithInsert(
  input: RecordSecurityEventInput,
  options: {
    enabled: boolean;
    insert: (payload: SecurityEventInsert) => Promise<{ error: Error | { message?: string } | null } | undefined>;
  },
) {
  if (!options.enabled) {
    return { recorded: false, skipped: true } as const;
  }

  const payload: SecurityEventInsert = {
    user_id: input.userId ?? null,
    event_type: input.eventType,
    route: input.route ?? null,
    result: input.result ?? null,
    metadata: sanitizeSecurityEventMetadata(input.metadata),
  };

  try {
    const result = await options.insert(payload);

    if (result?.error) {
      return { recorded: false, skipped: false } as const;
    }

    return { recorded: true, skipped: false } as const;
  } catch {
    return { recorded: false, skipped: false } as const;
  }
}
