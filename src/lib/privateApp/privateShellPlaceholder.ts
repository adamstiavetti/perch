export const PRIVATE_SHELL_ROUTE = "/app";

export const PRIVATE_SHELL_MESSAGE = {
  eyebrow: "Skybyrd Private Beta",
  title: "Access is not open yet.",
  description:
    "This private app area is reserved for verified airline-worker beta access.",
  detail: "Verification and login are coming in a later epoch.",
  disclaimer:
    "This locked placeholder is product scaffolding only. It is not a real security boundary or sign-in system.",
} as const;

export const PRIVATE_SHELL_NAV_ITEMS = [
  {
    label: "Home Base",
    description: "Future private app home surface.",
    disabled: true,
  },
  {
    label: "Base Boards",
    description: "Future base-specific knowledge surface.",
    disabled: true,
  },
  {
    label: "Layover Boards",
    description: "Future layover and city intel surface.",
    disabled: true,
  },
  {
    label: "Verified Rooms",
    description: "Future gated discussion surface.",
    disabled: true,
  },
  {
    label: "Profile",
    description: "Future account and handle setup surface.",
    disabled: true,
  },
  {
    label: "Verification",
    description: "Future aviation-worker verification surface.",
    disabled: true,
  },
  {
    label: "Admin",
    description: "Future admin-only operational surface.",
    disabled: true,
  },
] as const;
