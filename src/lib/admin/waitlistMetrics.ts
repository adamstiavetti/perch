import "server-only";

import { createStorageAdminClient, isStorageAdminConfigured } from "../supabase/storageAdmin";
import {
  buildWaitlistDashboardMetrics,
  type WaitlistDashboardMetrics,
  type WaitlistSignupRow,
} from "./waitlistMetricsCore";

export const WAITLIST_ADMIN_ROUTE = "/app/admin/waitlist";
export const WAITLIST_ADMIN_SCOPE = "operator.read_audit";
export const WAITLIST_METRICS_NOT_READY_MESSAGE =
  "Waitlist metrics are not ready yet. Apply the first-party waitlist migration and configure the service-role server environment before using this dashboard.";

const AGGREGATE_PAGE_SIZE = 1000;
const RECENT_QUERY_LIMIT = 50;
const WAITLIST_SELECT_COLUMNS = [
  "email",
  "normalized_email",
  "landing_path",
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "survey_completed_at",
  "created_at",
  "waitlist_survey_responses(aviation_connection, priority_base, useful_first, current_tools, verification_comfort, beta_help, discovery_source, created_at)",
].join(",");

export type WaitlistDashboardResult =
  | WaitlistDashboardMetrics
  | {
      ok: false;
      code: "not_ready" | "query_failed";
      message: string;
    };

async function fetchAllWaitlistAggregateRows(
  supabase: ReturnType<typeof createStorageAdminClient>,
) {
  const rows: WaitlistSignupRow[] = [];
  let from = 0;

  while (true) {
    const to = from + AGGREGATE_PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("waitlist_signups")
      .select(WAITLIST_SELECT_COLUMNS)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return { rows: [], error };
    }

    const pageRows = (data ?? []) as unknown as WaitlistSignupRow[];
    rows.push(...pageRows);

    if (pageRows.length < AGGREGATE_PAGE_SIZE) {
      return { rows, error: null };
    }

    from += AGGREGATE_PAGE_SIZE;
  }
}

async function fetchRecentWaitlistRows(
  supabase: ReturnType<typeof createStorageAdminClient>,
) {
  const { data, error } = await supabase
    .from("waitlist_signups")
    .select(WAITLIST_SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(RECENT_QUERY_LIMIT);

  return {
    rows: (data ?? []) as unknown as WaitlistSignupRow[],
    error,
  };
}

export async function getWaitlistDashboardForOperator(): Promise<WaitlistDashboardResult> {
  if (!isStorageAdminConfigured()) {
    return {
      ok: false,
      code: "not_ready",
      message: WAITLIST_METRICS_NOT_READY_MESSAGE,
    };
  }

  const supabase = createStorageAdminClient();
  const [aggregateResult, recentResult] = await Promise.all([
    fetchAllWaitlistAggregateRows(supabase),
    fetchRecentWaitlistRows(supabase),
  ]);

  if (aggregateResult.error || recentResult.error) {
    return {
      ok: false,
      code: "query_failed",
      message:
        "Waitlist metrics could not load. Confirm the first-party waitlist migration is applied.",
    };
  }

  return buildWaitlistDashboardMetrics(aggregateResult.rows, new Date(), recentResult.rows);
}
