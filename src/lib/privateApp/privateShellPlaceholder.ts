export const PRIVATE_SHELL_ROUTE = "/app";

export type PrivateShellMessage = {
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  disclaimer: string;
};

export type PrivateShellNavItem = {
  label: string;
  path: string;
  description: string;
  disabled: true;
};

export type PrivateShellChildRoute = {
  slug: string;
  path: string;
  navLabel: string;
  title: string;
  detail: string;
  message: PrivateShellMessage;
};

export const PRIVATE_SHELL_MESSAGE: PrivateShellMessage = {
  eyebrow: "Skybyrd Private Beta",
  title: "Access is not open yet.",
  description:
    "This private app area is reserved for verified airline-worker beta access.",
  detail: "Verification and login are coming in a later epoch.",
  disclaimer:
    "This locked placeholder is product scaffolding only. It is not a real security boundary or sign-in system.",
};

export const PRIVATE_SHELL_NAV_ITEMS: readonly PrivateShellNavItem[] = [
  {
    label: "Home Base",
    path: "/app/home",
    description: "Future private app home surface.",
    disabled: true,
  },
  {
    label: "Base Boards",
    path: "/app/base",
    description: "Future base-specific knowledge surface.",
    disabled: true,
  },
  {
    label: "Layover Boards",
    path: "/app/layovers",
    description: "Future layover and city intel surface.",
    disabled: true,
  },
  {
    label: "Verified Rooms",
    path: "/app/rooms",
    description: "Future gated discussion surface.",
    disabled: true,
  },
  {
    label: "Profile",
    path: "/app/profile",
    description: "Future account and handle setup surface.",
    disabled: true,
  },
  {
    label: "Verification",
    path: "/app/verification",
    description: "Future aviation-worker verification surface.",
    disabled: true,
  },
  {
    label: "Admin",
    path: "/app/admin",
    description: "Future admin-only operational surface.",
    disabled: true,
  },
] as const;

function createChildRouteMessage(label: string, routeContext: string): PrivateShellMessage {
  return {
    eyebrow: "Skybyrd Private Beta",
    title: `${label} is not available yet.`,
    description: `${routeContext} is reserved for a later private-beta epoch and is not open through this placeholder route.`,
    detail:
      "Real login and verification come later, and this route does not enforce actual account or access control yet.",
    disclaimer:
      "This route-level placeholder is scaffolding only. It is not a real security boundary or a working product surface.",
  };
}

export const PRIVATE_SHELL_CHILD_ROUTE_RECORD: Record<string, PrivateShellChildRoute> = {
  home: {
    slug: "home",
    path: "/app/home",
    navLabel: "Home Base",
    title: "Home Base is not available yet.",
    detail:
      "Real login and verification come later, and this route does not enforce actual account or access control yet.",
    message: createChildRouteMessage(
      "Home Base",
      "The future private app home surface",
    ),
  },
  base: {
    slug: "base",
    path: "/app/base",
    navLabel: "Base Boards",
    title: "Base Boards is not available yet.",
    detail:
      "Real login and verification come later, and this route does not enforce actual account or access control yet.",
    message: createChildRouteMessage(
      "Base Boards",
      "Base-specific knowledge and commuting guidance",
    ),
  },
  layovers: {
    slug: "layovers",
    path: "/app/layovers",
    navLabel: "Layover Boards",
    title: "Layover Boards is not available yet.",
    detail:
      "Real login and verification come later, and this route does not enforce actual account or access control yet.",
    message: createChildRouteMessage(
      "Layover Boards",
      "Layover and city-intel guidance",
    ),
  },
  rooms: {
    slug: "rooms",
    path: "/app/rooms",
    navLabel: "Verified Rooms",
    title: "Verified Rooms is not available yet.",
    detail:
      "Real login and verification come later, and this route does not enforce actual account or access control yet.",
    message: createChildRouteMessage(
      "Verified Rooms",
      "Gated discussion areas",
    ),
  },
  profile: {
    slug: "profile",
    path: "/app/profile",
    navLabel: "Profile",
    title: "Profile is not available yet.",
    detail:
      "Real login and verification come later, and this route does not enforce actual account or access control yet.",
    message: createChildRouteMessage(
      "Profile",
      "Account and public-handle setup",
    ),
  },
  verification: {
    slug: "verification",
    path: "/app/verification",
    navLabel: "Verification",
    title: "Verification is not available yet.",
    detail:
      "Real login and verification come later, and this route does not enforce actual account or access control yet.",
    message: createChildRouteMessage(
      "Verification",
      "Aviation-worker verification",
    ),
  },
  admin: {
    slug: "admin",
    path: "/app/admin",
    navLabel: "Admin",
    title: "Admin is not available yet.",
    detail:
      "Real login and verification come later, and this route does not enforce actual account or access control yet.",
    message: createChildRouteMessage(
      "Admin",
      "Admin-only operational tooling",
    ),
  },
};

export function getPrivateShellChildRoute(
  slug: string,
): PrivateShellChildRoute | null {
  return PRIVATE_SHELL_CHILD_ROUTE_RECORD[slug] ?? null;
}
