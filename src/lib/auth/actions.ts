"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_ROUTES, resolvePostAuthPath, sanitizeNextPath } from "./routes";
import { resolveCurrentUserAppPath } from "../betaAccess/server";
import { getEmailDomain } from "../securityEvents/securityEvents";
import { recordSecurityEvent } from "../securityEvents/server";
import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function buildRedirect(path: string, params: Record<string, string | null | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const suffix = search.toString();
  return suffix ? `${path}?${suffix}` : path;
}

function toMessage(error: { message?: string } | null) {
  if (!error?.message) {
    return "Something went wrong. Please try again.";
  }

  return error.message;
}

function getConfirmationCode(formData: FormData) {
  return getString(formData, "account_code").replace(/\s+/g, "");
}

async function getAuthOrigin() {
  const headerStore = await headers();
  return headerStore.get("origin") ?? "http://localhost:3000";
}

export async function signInAction(formData: FormData) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(
      buildRedirect(AUTH_ROUTES.login, {
        error:
          "Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      }),
    );
  }

  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const next = sanitizeNextPath(getString(formData, "next"));
  const emailDomain = getEmailDomain(email);

  await recordSecurityEvent({
    eventType: "auth.sign_in_attempt",
    route: AUTH_ROUTES.login,
    result: "attempt",
    metadata: {
      email_domain: emailDomain,
      next_path: next,
    },
  });

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    await recordSecurityEvent({
      eventType: "auth.sign_in_failed",
      route: AUTH_ROUTES.login,
      result: "failed",
      metadata: {
        email_domain: emailDomain,
      },
    });
    redirect(
      buildRedirect(AUTH_ROUTES.login, {
        error: toMessage(error),
        next,
      }),
    );
  }

  await recordSecurityEvent({
    eventType: "auth.sign_in_success",
    route: AUTH_ROUTES.login,
    result: "success",
    metadata: {
      email_domain: emailDomain,
      next_path: next,
    },
  });

  redirect(resolvePostAuthPath(next));
}

export async function signUpAction(formData: FormData) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(
      buildRedirect(AUTH_ROUTES.signup, {
        error:
          "Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      }),
    );
  }

  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const origin = await getAuthOrigin();
  const emailRedirectTo = new URL(AUTH_ROUTES.callback, origin).toString();
  const emailDomain = getEmailDomain(email);

  await recordSecurityEvent({
    eventType: "auth.sign_up_attempt",
    route: AUTH_ROUTES.signup,
    result: "attempt",
    metadata: {
      email_domain: emailDomain,
    },
  });

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    await recordSecurityEvent({
      eventType: "auth.sign_up_failed",
      route: AUTH_ROUTES.signup,
      result: "failed",
      metadata: {
        email_domain: emailDomain,
      },
    });
    redirect(
      buildRedirect(AUTH_ROUTES.signup, {
        error: toMessage(error),
      }),
    );
  }

  await recordSecurityEvent({
    eventType: "auth.sign_up_success",
    route: AUTH_ROUTES.signup,
    result: "success",
    metadata: {
      email_domain: emailDomain,
    },
  });

  redirect(
    buildRedirect(AUTH_ROUTES.signup, {
      mode: "confirm",
      message:
        "Check your account email. Enter the six-digit code we sent to finish creating your jmpseat account.",
    }),
  );
}

export async function confirmAccountCodeAction(formData: FormData) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(
      buildRedirect(AUTH_ROUTES.signup, {
        mode: "confirm",
        error:
          "Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      }),
    );
  }

  const email = getString(formData, "email");
  const confirmationCode = getConfirmationCode(formData);
  const emailDomain = getEmailDomain(email);

  await recordSecurityEvent({
    eventType: "auth.sign_up_attempt",
    route: AUTH_ROUTES.signup,
    result: "account_code_attempt",
    metadata: {
      email_domain: emailDomain,
    },
  });

  if (!email || !/^[0-9]{6}$/.test(confirmationCode)) {
    await recordSecurityEvent({
      eventType: "auth.sign_up_failed",
      route: AUTH_ROUTES.signup,
      result: "invalid_account_code_shape",
      metadata: {
        email_domain: emailDomain,
      },
    });
    redirect(
      buildRedirect(AUTH_ROUTES.signup, {
        mode: "confirm",
        error: "Enter the six-digit account confirmation code from your email.",
      }),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: confirmationCode,
    type: "email",
  });

  if (error) {
    await recordSecurityEvent({
      eventType: "auth.sign_up_failed",
      route: AUTH_ROUTES.signup,
      result: "account_code_verify_failed",
      metadata: {
        email_domain: emailDomain,
      },
    });
    redirect(
      buildRedirect(AUTH_ROUTES.signup, {
        mode: "confirm",
        error:
          "That account confirmation code is invalid or expired. Please request a new code or sign up again.",
      }),
    );
  }

  await recordSecurityEvent({
    eventType: "auth.sign_up_success",
    route: AUTH_ROUTES.signup,
    result: "account_code_confirmed",
    metadata: {
      email_domain: emailDomain,
    },
  });

  const destination = await resolveCurrentUserAppPath(AUTH_ROUTES.app);
  redirect(destination);
}

export async function requestPasswordResetAction(formData: FormData) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(
      buildRedirect(AUTH_ROUTES.resetPassword, {
        error:
          "Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      }),
    );
  }

  const email = getString(formData, "email");
  const origin = await getAuthOrigin();
  const emailDomain = getEmailDomain(email);
  const redirectTo = new URL(
    `${AUTH_ROUTES.callback}?next=${encodeURIComponent(AUTH_ROUTES.resetPassword)}&mode=update`,
    origin,
  ).toString();

  await recordSecurityEvent({
    eventType: "auth.password_reset_requested",
    route: AUTH_ROUTES.resetPassword,
    result: "attempt",
    metadata: {
      email_domain: emailDomain,
    },
  });

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    await recordSecurityEvent({
      eventType: "auth.password_reset_request_failed",
      route: AUTH_ROUTES.resetPassword,
      result: "failed",
      metadata: {
        email_domain: emailDomain,
      },
    });
    redirect(
      buildRedirect(AUTH_ROUTES.resetPassword, {
        error: toMessage(error),
      }),
    );
  }

  await recordSecurityEvent({
    eventType: "auth.password_reset_requested",
    route: AUTH_ROUTES.resetPassword,
    result: "success",
    metadata: {
      email_domain: emailDomain,
    },
  });

  redirect(
    buildRedirect(AUTH_ROUTES.resetPassword, {
      message: "Check your email for a password reset link.",
    }),
  );
}

export async function updatePasswordAction(formData: FormData) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(
      buildRedirect(AUTH_ROUTES.resetPassword, {
        error:
          "Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      }),
    );
  }

  const password = getString(formData, "password");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    redirect(
      buildRedirect(AUTH_ROUTES.resetPassword, {
        mode: "update",
        error: toMessage(error),
      }),
    );
  }

  redirect(
    buildRedirect(AUTH_ROUTES.login, {
      message: "Your password has been updated. Please sign in.",
    }),
  );
}

export async function signOutAction() {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(AUTH_ROUTES.login);
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(AUTH_ROUTES.login);
}
