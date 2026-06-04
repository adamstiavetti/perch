import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "../supabase/server";
import { getSupabaseBrowserEnv } from "../supabase/config";
import {
  recordSecurityEventWithInsert,
  type RecordSecurityEventInput,
  type SecurityEventInsert,
} from "./securityEvents";

const SECURITY_EVENTS_SERVER_ONLY = "server-only";
void SECURITY_EVENTS_SERVER_ONLY;

type SecurityEventInsertResult =
  | { error: PostgrestError | Error | null }
  | undefined;

async function insertSecurityEvent(payload: SecurityEventInsert): Promise<SecurityEventInsertResult> {
  const supabase = await createClient();
  return supabase.from("security_events").insert(payload);
}

export async function recordSecurityEvent(input: RecordSecurityEventInput) {
  const env = getSupabaseBrowserEnv();

  return recordSecurityEventWithInsert(input, {
    enabled: env.enabled,
    insert: insertSecurityEvent,
  });
}
