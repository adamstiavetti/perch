import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const actionSource = existsSync(
  new URL("../../src/lib/community/boardPostCommentActions.ts", import.meta.url),
)
  ? readFileSync(
      new URL("../../src/lib/community/boardPostCommentActions.ts", import.meta.url),
      "utf8",
    )
  : "";

const actionStateSource = existsSync(
  new URL("../../src/lib/community/boardPostCommentActionState.ts", import.meta.url),
)
  ? readFileSync(
      new URL("../../src/lib/community/boardPostCommentActionState.ts", import.meta.url),
      "utf8",
    )
  : "";

test("T19 comment action is server-only, gate-checked, and calls the comment create RPC", () => {
  assert.match(actionSource, /"use server"/);
  assert.match(actionSource, /createDfwBaseboardPostCommentAction/);
  assert.match(actionSource, /getCurrentAppAccessContext/);
  assert.match(actionSource, /getPrivateAppGateResult/);
  assert.match(actionSource, /routeKind: "private-child"/);
  assert.match(actionSource, /recordSecurityEvent/);
  assert.match(actionSource, /action: "create_dfw_baseboard_post_comment"/);
  assert.match(actionSource, /redirect\(gate\.path\)/);
  assert.match(actionSource, /create_open_baseboard_post_comment/);
  assert.match(actionSource, /p_base_code: "DFW"/);
  assert.match(actionSource, /p_post_id: postId/);
  assert.match(actionSource, /p_body: body/);
  assert.match(actionSource, /revalidatePath\(getDfwBaseboardPostHref\(postId\)\)/);
  assert.match(actionSource, /DFW_BASEBOARD_COMMENT_CREATED_STATUS/);
  assert.match(actionSource, /DFW_BASEBOARD_COMMENT_INVALID_STATUS/);
  assert.match(actionSource, /DFW_BASEBOARD_COMMENT_FAILED_STATUS/);
  assert.match(
    actionSource,
    /getPrivateAppGateResult[\s\S]*if \(gate\.kind === "redirect"\)[\s\S]*create_open_baseboard_post_comment/s,
  );

  assert.doesNotMatch(actionSource, /service_role|\.insert\(|\.update\(|\.delete\(|parent_comment|report_open_baseboard_post|"moderate_open_baseboard_post"/i);
});

test("T19 comment action validates post UUID and comment body before RPC", () => {
  assert.match(actionSource, /isUuid/);
  assert.match(actionSource, /String\(formData\.get\("postId"\) \?\? ""\)\.trim\(\)/);
  assert.match(actionSource, /String\(formData\.get\("commentBody"\) \?\? ""\)\.trim\(\)/);
  assert.match(actionSource, /body\.length === 0/);
  assert.match(actionSource, /body\.length > 2000/);
  assert.match(actionSource, /DFW_BASEBOARD_COMMENT_INVALID_STATUS/);
  assert.match(actionSource, /DFW_BASEBOARD_COMMENT_FAILED_STATUS/);
});

test("T19 comment action state exposes only safe redirect statuses", () => {
  assert.match(actionStateSource, /DFW_BASEBOARD_COMMENT_STATUS_PARAM = "comment"/);
  assert.match(actionStateSource, /DFW_BASEBOARD_COMMENT_CREATED_STATUS = "dfw_baseboard_comment_created"/);
  assert.match(actionStateSource, /DFW_BASEBOARD_COMMENT_INVALID_STATUS = "dfw_baseboard_comment_invalid"/);
  assert.match(actionStateSource, /DFW_BASEBOARD_COMMENT_FAILED_STATUS = "dfw_baseboard_comment_failed"/);
  assert.match(actionStateSource, /isDfwBaseboardCommentStatus/);
  assert.doesNotMatch(actionStateSource, /eligib|verification|sql|auth|author|moderation|reporter/i);
});

test("T19 comment moderation action is server-only and calls only the comment moderation RPC", () => {
  assert.match(actionSource, /"use server"/);
  assert.match(actionSource, /moderateDfwBaseboardPostCommentAction/);
  assert.match(actionSource, /getCurrentOperatorAccess/);
  assert.match(actionSource, /hasOperatorScope/);
  assert.match(actionSource, /COMMUNITY_MODERATION_SCOPE/);
  assert.match(actionSource, /recordSecurityEvent/);
  assert.match(actionSource, /action: "moderate_dfw_baseboard_post_comment"/);
  assert.match(actionSource, /moderate_open_baseboard_post_comment/);
  assert.match(actionSource, /p_base_code: "DFW"/);
  assert.match(actionSource, /p_comment_id: commentId/);
  assert.match(actionSource, /p_action: action/);
  assert.match(actionSource, /p_reason: reason/);
  assert.match(actionSource, /ADMIN_ROUTES\.communityModeration/);
  assert.match(actionSource, /revalidatePath\(ADMIN_ROUTES\.communityModeration\)/);
  assert.match(actionSource, /revalidatePath\(getDfwBaseboardPostHref\(postId\)\)/);

  assert.doesNotMatch(actionSource, /"moderate_open_baseboard_post"|comment_report|report_comment|moderation queue|service_role|createBrowserClient|\.insert\(|\.update\(|\.delete\(/i);
});

test("T19 comment moderation action validates comment id, action, reason, and safe statuses", () => {
  assert.match(actionSource, /String\(formData\.get\("commentId"\) \?\? ""\)\.trim\(\)/);
  assert.match(actionSource, /String\(formData\.get\("moderationAction"\) \?\? ""\)\.trim\(\)/);
  assert.match(actionSource, /String\(formData\.get\("reason"\) \?\? ""\)\.trim\(\)/);
  assert.match(actionSource, /!isUuid\(commentId\)/);
  assert.match(actionSource, /action !== "hide" && action !== "remove"/);
  assert.match(actionSource, /reason\.length === 0/);
  assert.match(actionSource, /reason\.length > 1000/);
  assert.match(actionSource, /dfw_baseboard_comment_moderation_applied/);
  assert.match(actionSource, /dfw_baseboard_comment_moderation_invalid/);
  assert.match(actionSource, /dfw_baseboard_comment_moderation_failed/);
  assert.match(actionSource, /dfw_baseboard_comment_moderation_denied/);
  assert.doesNotMatch(actionSource, /sql|verification|eligib|reporter_user_id|author_user_id|post title|post body/i);
});
