export const JMPSEAT_LAUNCH_MODES = [
  "private_testing",
  "first_base_launch",
  "broader_launch",
  "internal_test",
] as const;

export type JmpseatLaunchMode = (typeof JMPSEAT_LAUNCH_MODES)[number];

export const DEFAULT_JMPSEAT_LAUNCH_MODE: JmpseatLaunchMode = "private_testing";
export const JMPSEAT_LAUNCH_MODE_ENV = "JMPSEAT_LAUNCH_MODE";

export function normalizeJmpseatLaunchMode(
  value: string | null | undefined,
): JmpseatLaunchMode {
  const normalized = value?.trim().toLowerCase();

  return (
    JMPSEAT_LAUNCH_MODES.find((candidate) => candidate === normalized) ??
    DEFAULT_JMPSEAT_LAUNCH_MODE
  );
}

export function getJmpseatLaunchMode(
  env: Record<string, string | undefined> = process.env,
) {
  return normalizeJmpseatLaunchMode(env[JMPSEAT_LAUNCH_MODE_ENV]);
}

export function doesLaunchModeRequireBeta(mode: JmpseatLaunchMode) {
  return mode === "private_testing" || mode === "internal_test";
}

export function doesLaunchModeRequireAirlineEmail(mode: JmpseatLaunchMode) {
  void mode;
  return true;
}
