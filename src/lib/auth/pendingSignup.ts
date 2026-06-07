import { cookies } from "next/headers";

import { AUTH_ROUTES } from "./routes";

export const PENDING_SIGNUP_EMAIL_COOKIE = "jmpseat_pending_signup_email";
export const PENDING_SIGNUP_EMAIL_MAX_AGE_SECONDS = 15 * 60;

function isValidPendingSignupEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function setPendingSignupEmail(email: string) {
  const cookieStore = await cookies();
  cookieStore.set(PENDING_SIGNUP_EMAIL_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: PENDING_SIGNUP_EMAIL_MAX_AGE_SECONDS,
    path: AUTH_ROUTES.signup,
  });
}

export async function clearPendingSignupEmail() {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_SIGNUP_EMAIL_COOKIE);
}

export async function getPendingSignupEmail() {
  const cookieStore = await cookies();
  const email = cookieStore.get(PENDING_SIGNUP_EMAIL_COOKIE)?.value.trim() ?? "";

  return isValidPendingSignupEmail(email) ? email : "";
}

export function maskAccountEmail(email: string) {
  const [localPart = "", domain = ""] = email.split("@");

  if (!localPart || !domain) {
    return "";
  }

  const maskedLocal =
    localPart.length <= 2
      ? `${localPart[0] ?? ""}***`
      : `${localPart.slice(0, 2)}***${localPart.slice(-1)}`;

  return `${maskedLocal}@${domain}`;
}
