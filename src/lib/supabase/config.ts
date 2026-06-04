export const SUPABASE_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

export type SupabaseBrowserEnv = {
  enabled: boolean;
  url: string;
  publishableKey: string;
};

export function isSupabaseEnvRequired(
  source: Record<string, string | undefined> = process.env,
) {
  return source.NODE_ENV === "production";
}

export function getSupabaseMissingEnvMessage() {
  return `Supabase auth is not configured. Set ${SUPABASE_ENV_KEYS.join(" and ")}.`;
}

export function getSupabaseBrowserEnv(
  source: Record<string, string | undefined> = process.env,
): SupabaseBrowserEnv {
  const url = source.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey =
    source.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

  return {
    enabled: Boolean(url && publishableKey),
    url,
    publishableKey,
  };
}

export function requireSupabaseBrowserEnv(
  source: Record<string, string | undefined> = process.env,
): SupabaseBrowserEnv {
  const env = getSupabaseBrowserEnv(source);

  if (env.enabled) {
    return env;
  }

  throw new Error(getSupabaseMissingEnvMessage());
}
