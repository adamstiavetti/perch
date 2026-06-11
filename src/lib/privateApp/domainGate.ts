const DEFAULT_PUBLIC_MARKETING_HOSTS = ["jmpseat.com", "www.jmpseat.com"] as const;

const PRIVATE_BETA_ENTRY_PATHS = [
  "/app",
  "/login",
  "/signup",
  "/reset-password",
  "/auth",
] as const;

function splitConfiguredHosts(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((host) => normalizeHost(host))
    .filter((host): host is string => Boolean(host));
}

export function normalizeHost(host: string | null | undefined) {
  const trimmed = host?.split(",")[0]?.trim().toLowerCase();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("[::1]")) {
    return "::1";
  }

  return trimmed.replace(/:\d+$/, "");
}

export function getRequestHost(headers: Headers, fallbackHost?: string | null) {
  return (
    normalizeHost(headers.get("x-forwarded-host")) ??
    normalizeHost(headers.get("host")) ??
    normalizeHost(fallbackHost)
  );
}

export function getPublicMarketingHosts() {
  const configuredHosts = splitConfiguredHosts(
    process.env.JMPSEAT_PUBLIC_MARKETING_HOSTS,
  );

  if (configuredHosts.length > 0) {
    return configuredHosts;
  }

  return [...DEFAULT_PUBLIC_MARKETING_HOSTS];
}

export function isPublicMarketingHost(host: string | null | undefined) {
  const normalizedHost = normalizeHost(host);

  if (!normalizedHost) {
    return false;
  }

  return getPublicMarketingHosts().includes(normalizedHost);
}

export function isPrivateBetaEntryPath(pathname: string) {
  return PRIVATE_BETA_ENTRY_PATHS.some(
    (entryPath) => pathname === entryPath || pathname.startsWith(`${entryPath}/`),
  );
}

export function shouldBlockPublicMarketingHostPath(
  host: string | null | undefined,
  pathname: string,
) {
  return isPublicMarketingHost(host) && isPrivateBetaEntryPath(pathname);
}
