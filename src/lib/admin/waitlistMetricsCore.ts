const RECENT_SIGNUP_LIMIT = 12;
const TOP_VALUE_LIMIT = 8;
const SAFE_TEXT_PATTERN = /^[a-z0-9 .,'/&()+#_-]{1,80}$/i;
const SENSITIVE_TEXT_PATTERN =
  /employee\s*id|badge|document|proof|password|portal|passenger|hotel|schedule|credential|token|code|uuid|@/i;

export type WaitlistSignupRow = {
  email: string | null;
  normalized_email: string | null;
  landing_path: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  survey_completed_at: string | null;
  created_at: string;
  waitlist_survey_responses:
    | {
        aviation_connection: string | null;
        priority_base: string | null;
        useful_first: string[] | null;
        current_tools: string[] | null;
        verification_comfort: string | null;
        beta_help: string[] | null;
        discovery_source: string | null;
        created_at: string | null;
      }[]
    | null;
};

export type WaitlistTopValue = {
  label: string;
  count: number;
};

export type WaitlistRecentSignup = {
  maskedEmail: string;
  createdAt: string;
  surveyCompleted: boolean;
  aviationConnection: string | null;
  priorityBase: string | null;
  discoverySource: string | null;
};

export type WaitlistDashboardMetrics = {
  ok: true;
  totalSignups: number;
  signupsToday: number;
  signupsLast7Days: number;
  signupsLast30Days: number;
  surveyCompletedCount: number;
  surveyCompletionRate: number;
  recentSubmissionsCount: number;
  topAviationConnections: WaitlistTopValue[];
  topDesiredFeatures: WaitlistTopValue[];
  topBaseValues: WaitlistTopValue[];
  topDiscoverySources: WaitlistTopValue[];
  topAttributionSources: WaitlistTopValue[];
  recentSignups: WaitlistRecentSignup[];
};

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function daysAgo(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() - days);
  return next;
}

export function maskWaitlistEmail(email: string | null | undefined) {
  const normalized = email?.trim().toLowerCase() ?? "";
  const [localPart, domain] = normalized.split("@");

  if (!localPart || !domain) {
    return "hidden";
  }

  return `${localPart.slice(0, 1)}...@${domain}`;
}

function getSurvey(row: WaitlistSignupRow) {
  return row.waitlist_survey_responses?.[0] ?? null;
}

function hasSurvey(row: WaitlistSignupRow) {
  return Boolean(row.survey_completed_at || getSurvey(row));
}

function normalizeSafeText(value: string | null | undefined) {
  const trimmed = value?.trim().replace(/\s+/g, " ") ?? "";

  if (
    !trimmed ||
    trimmed.length > 80 ||
    !SAFE_TEXT_PATTERN.test(trimmed) ||
    SENSITIVE_TEXT_PATTERN.test(trimmed)
  ) {
    return null;
  }

  return trimmed;
}

function addCount(
  counts: Map<string, number>,
  value: string | null | undefined,
  options: { freeText?: boolean } = {},
) {
  const label = options.freeText ? normalizeSafeText(value) : value?.trim();

  if (!label) {
    return;
  }

  counts.set(label, (counts.get(label) ?? 0) + 1);
}

function addArrayCounts(counts: Map<string, number>, values: string[] | null | undefined) {
  for (const value of values ?? []) {
    addCount(counts, value);
  }
}

function toTopValues(counts: Map<string, number>) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TOP_VALUE_LIMIT)
    .map(([label, count]) => ({ label, count }));
}

function getAttributionLabel(row: WaitlistSignupRow) {
  let referrerHost: string | null = null;

  if (row.referrer) {
    try {
      referrerHost = new URL(row.referrer).hostname;
    } catch {
      referrerHost = row.referrer;
    }
  }

  return (
    normalizeSafeText(row.utm_source) ||
    normalizeSafeText(row.utm_campaign) ||
    normalizeSafeText(referrerHost) ||
    normalizeSafeText(row.landing_path) ||
    null
  );
}

export function buildWaitlistDashboardMetrics(
  aggregateRows: WaitlistSignupRow[],
  now: Date = new Date(),
  recentRows: WaitlistSignupRow[] = aggregateRows,
): WaitlistDashboardMetrics {
  const todayStart = startOfUtcDay(now);
  const last7Days = daysAgo(now, 7);
  const last30Days = daysAgo(now, 30);
  const topAviationConnections = new Map<string, number>();
  const topDesiredFeatures = new Map<string, number>();
  const topBaseValues = new Map<string, number>();
  const topDiscoverySources = new Map<string, number>();
  const topAttributionSources = new Map<string, number>();

  let signupsToday = 0;
  let signupsLast7Days = 0;
  let signupsLast30Days = 0;
  let surveyCompletedCount = 0;

  for (const row of aggregateRows) {
    const createdAt = new Date(row.created_at);
    const survey = getSurvey(row);

    if (createdAt >= todayStart) {
      signupsToday += 1;
    }

    if (createdAt >= last7Days) {
      signupsLast7Days += 1;
    }

    if (createdAt >= last30Days) {
      signupsLast30Days += 1;
    }

    if (hasSurvey(row)) {
      surveyCompletedCount += 1;
    }

    addCount(topAviationConnections, survey?.aviation_connection);
    addArrayCounts(topDesiredFeatures, survey?.useful_first);
    addCount(topBaseValues, survey?.priority_base, { freeText: true });
    addCount(topDiscoverySources, survey?.discovery_source);
    addCount(topAttributionSources, getAttributionLabel(row));
  }

  const recentSignups = recentRows.slice(0, RECENT_SIGNUP_LIMIT).map((row) => {
    const survey = getSurvey(row);

    return {
      maskedEmail: maskWaitlistEmail(row.normalized_email ?? row.email),
      createdAt: row.created_at,
      surveyCompleted: hasSurvey(row),
      aviationConnection: survey?.aviation_connection ?? null,
      priorityBase: normalizeSafeText(survey?.priority_base),
      discoverySource: survey?.discovery_source ?? null,
    };
  });

  return {
    ok: true,
    totalSignups: aggregateRows.length,
    signupsToday,
    signupsLast7Days,
    signupsLast30Days,
    surveyCompletedCount,
    surveyCompletionRate:
      aggregateRows.length > 0
        ? Math.round((surveyCompletedCount / aggregateRows.length) * 100)
        : 0,
    recentSubmissionsCount: recentSignups.length,
    topAviationConnections: toTopValues(topAviationConnections),
    topDesiredFeatures: toTopValues(topDesiredFeatures),
    topBaseValues: toTopValues(topBaseValues),
    topDiscoverySources: toTopValues(topDiscoverySources),
    topAttributionSources: toTopValues(topAttributionSources),
    recentSignups,
  };
}
