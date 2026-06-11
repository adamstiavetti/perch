"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  ADMIN_ROUTES,
  COMMUNITY_MODERATION_SCOPE,
  getCurrentOperatorAccess,
  hasOperatorScope,
} from "../admin/access";
import { getCurrentAppAccessContext } from "../betaAccess/server";
import {
  getPrivateAccessSource,
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "../privateApp/access";
import { getPrivateAccessEventType } from "../securityEvents/securityEvents";
import { recordSecurityEvent } from "../securityEvents/server";
import { createClient } from "../supabase/server";
import {
  DFW_BASEBOARD_COMMENT_CREATED_STATUS,
  DFW_BASEBOARD_COMMENT_FAILED_STATUS,
  DFW_BASEBOARD_COMMENT_INVALID_STATUS,
  DFW_BASEBOARD_COMMENT_REPORT_FAILED_STATUS,
  DFW_BASEBOARD_COMMENT_REPORT_INVALID_STATUS,
  DFW_BASEBOARD_COMMENT_REPORT_REPORTED_STATUS,
  DFW_BASEBOARD_COMMENT_REPORT_STATUS_PARAM,
  DFW_BASEBOARD_COMMENT_STATUS_PARAM,
} from "./boardPostCommentActionState";

const DFW_BASEBOARD_ROUTE = "/app/hubs/dfw/baseboard";
const REPORT_REASON_VALUES = new Set([
  "spam",
  "harassment",
  "unsafe_info",
  "privacy",
  "off_topic",
  "other",
]);
const COMMENT_MODERATION_STATUS_PARAM = "comment_moderation";
const COMMENT_MODERATION_APPLIED_STATUS =
  "dfw_baseboard_comment_moderation_applied";
const COMMENT_MODERATION_INVALID_STATUS =
  "dfw_baseboard_comment_moderation_invalid";
const COMMENT_MODERATION_FAILED_STATUS =
  "dfw_baseboard_comment_moderation_failed";
const COMMENT_MODERATION_DENIED_STATUS =
  "dfw_baseboard_comment_moderation_denied";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function getDfwBaseboardPostHref(postId: string) {
  return `${DFW_BASEBOARD_ROUTE}/${encodeURIComponent(postId)}`;
}

function buildDfwBaseboardCommentRedirect(postId: string, status: string) {
  const search = new URLSearchParams({
    [DFW_BASEBOARD_COMMENT_STATUS_PARAM]: status,
  });

  return `${getDfwBaseboardPostHref(postId)}?${search.toString()}`;
}

function buildDfwBaseboardCommentModerationRedirect(status: string) {
  const search = new URLSearchParams({
    [COMMENT_MODERATION_STATUS_PARAM]: status,
  });

  return `${ADMIN_ROUTES.communityModeration}?${search.toString()}`;
}

function buildDfwBaseboardCommentReportRedirect(postId: string, status: string) {
  const search = new URLSearchParams({
    [DFW_BASEBOARD_COMMENT_REPORT_STATUS_PARAM]: status,
  });

  return `${getDfwBaseboardPostHref(postId)}?${search.toString()}`;
}

export async function createDfwBaseboardPostCommentAction(formData: FormData) {
  const postId = String(formData.get("postId") ?? "").trim();
  const body = String(formData.get("commentBody") ?? "").trim();
  const route = isUuid(postId) ? getDfwBaseboardPostHref(postId) : DFW_BASEBOARD_ROUTE;
  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: route,
    context,
  });

  await recordSecurityEvent({
    userId: context.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route,
    result: getPrivateRouteAuditResult(gate, context),
    metadata: {
      route_kind: "private-child",
      section: "dfw-baseboard-comment",
      action: "create_dfw_baseboard_post_comment",
      access_source: getPrivateAccessSource(gate),
      ...(getPrivateAccessSource(gate) === "operator_internal"
        ? { operator_private_app_access: true }
        : {}),
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  if (!isUuid(postId) || body.length === 0 || body.length > 2000) {
    redirect(
      isUuid(postId)
        ? buildDfwBaseboardCommentRedirect(
            postId,
            DFW_BASEBOARD_COMMENT_INVALID_STATUS,
          )
        : DFW_BASEBOARD_ROUTE,
    );
  }

  if (!context.authConfigured || !context.user) {
    redirect(buildDfwBaseboardCommentRedirect(postId, DFW_BASEBOARD_COMMENT_FAILED_STATUS));
  }

  const supabase = await createClient();
  const result = await supabase.rpc("create_open_baseboard_post_comment", {
    p_base_code: "DFW",
    p_post_id: postId,
    p_body: body,
  });

  if (result.error || !result.data) {
    redirect(buildDfwBaseboardCommentRedirect(postId, DFW_BASEBOARD_COMMENT_FAILED_STATUS));
  }

  revalidatePath(getDfwBaseboardPostHref(postId));
  redirect(buildDfwBaseboardCommentRedirect(postId, DFW_BASEBOARD_COMMENT_CREATED_STATUS));
}

export async function reportDfwBaseboardPostCommentAction(formData: FormData) {
  const postId = String(formData.get("postId") ?? "").trim();
  const commentId = String(formData.get("commentId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim().toLowerCase();
  const details = String(formData.get("details") ?? "").trim();
  const route = isUuid(postId) ? getDfwBaseboardPostHref(postId) : DFW_BASEBOARD_ROUTE;
  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: route,
    context,
  });

  await recordSecurityEvent({
    userId: context.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route,
    result: getPrivateRouteAuditResult(gate, context),
    metadata: {
      route_kind: "private-child",
      section: "dfw-baseboard-comment-report",
      action: "report_dfw_baseboard_post_comment",
      access_source: getPrivateAccessSource(gate),
      ...(getPrivateAccessSource(gate) === "operator_internal"
        ? { operator_private_app_access: true }
        : {}),
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  if (
    !isUuid(postId) ||
    !isUuid(commentId) ||
    !REPORT_REASON_VALUES.has(reason) ||
    details.length > 1000
  ) {
    redirect(
      isUuid(postId)
        ? buildDfwBaseboardCommentReportRedirect(
            postId,
            DFW_BASEBOARD_COMMENT_REPORT_INVALID_STATUS,
          )
        : DFW_BASEBOARD_ROUTE,
    );
  }

  if (!context.authConfigured || !context.user) {
    redirect(
      buildDfwBaseboardCommentReportRedirect(
        postId,
        DFW_BASEBOARD_COMMENT_REPORT_FAILED_STATUS,
      ),
    );
  }

  const supabase = await createClient();
  const result = await supabase.rpc("report_open_baseboard_post_comment", {
    p_base_code: "DFW",
    p_comment_id: commentId,
    p_reason: reason,
    p_details: details,
  });

  if (result.error || !result.data) {
    redirect(
      buildDfwBaseboardCommentReportRedirect(
        postId,
        DFW_BASEBOARD_COMMENT_REPORT_FAILED_STATUS,
      ),
    );
  }

  revalidatePath(getDfwBaseboardPostHref(postId));
  redirect(
    buildDfwBaseboardCommentReportRedirect(
      postId,
      DFW_BASEBOARD_COMMENT_REPORT_REPORTED_STATUS,
    ),
  );
}

export async function moderateDfwBaseboardPostCommentAction(formData: FormData) {
  const access = await getCurrentOperatorAccess();
  const commentId = String(formData.get("commentId") ?? "").trim();
  const postId = String(formData.get("postId") ?? "").trim();
  const action = String(formData.get("moderationAction") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const hasScope = hasOperatorScope({
    scopes: access.scopes,
    scope: COMMUNITY_MODERATION_SCOPE,
  });

  await recordSecurityEvent({
    userId: access.user?.id,
    eventType: "operator_audit.viewed",
    route: ADMIN_ROUTES.communityModeration,
    result: hasScope ? "requested" : "denied",
    metadata: {
      section: "dfw-baseboard-comment-safety",
      action: "moderate_dfw_baseboard_post_comment",
      moderation_action: action,
      reason_code: hasScope ? "operator_scope_present" : "missing_operator_scope",
    },
  });

  if (!hasScope) {
    redirect(
      buildDfwBaseboardCommentModerationRedirect(COMMENT_MODERATION_DENIED_STATUS),
    );
  }

  if (
    !isUuid(commentId) ||
    (action !== "hide" && action !== "remove") ||
    reason.length === 0 ||
    reason.length > 1000
  ) {
    redirect(
      buildDfwBaseboardCommentModerationRedirect(COMMENT_MODERATION_INVALID_STATUS),
    );
  }

  const supabase = await createClient();
  const result = await supabase.rpc("moderate_open_baseboard_post_comment", {
    p_base_code: "DFW",
    p_comment_id: commentId,
    p_action: action,
    p_reason: reason,
  });

  if (result.error || !result.data) {
    redirect(
      buildDfwBaseboardCommentModerationRedirect(COMMENT_MODERATION_FAILED_STATUS),
    );
  }

  revalidatePath(ADMIN_ROUTES.communityModeration);

  if (isUuid(postId)) {
    revalidatePath(getDfwBaseboardPostHref(postId));
  }

  redirect(
    buildDfwBaseboardCommentModerationRedirect(COMMENT_MODERATION_APPLIED_STATUS),
  );
}
