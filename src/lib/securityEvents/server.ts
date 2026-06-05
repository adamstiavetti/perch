import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "../supabase/server";
import { getSupabaseBrowserEnv } from "../supabase/config";
import { createStorageAdminClient, isStorageAdminConfigured } from "../supabase/storageAdmin";
import {
  recordSecurityEventWithInsert,
  type RecordSecurityEventInput,
  type SecurityEventInsert,
} from "./securityEvents";

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

export async function recordSecurityEventWithServiceRole(
  input: RecordSecurityEventInput,
) {
  return recordSecurityEventWithInsert(input, {
    enabled: isStorageAdminConfigured(),
    insert: async (payload) => {
      const supabase = createStorageAdminClient();
      return supabase.from("security_events").insert(payload);
    },
  });
}
