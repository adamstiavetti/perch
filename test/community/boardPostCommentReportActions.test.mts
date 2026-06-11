import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const actionSource = readFileSync(
  new URL("../../src/lib/community/boardPostCommentActions.ts", import.meta.url),
  "utf8",
);
const actionStateSource = readFileSync(
  new URL("../../src/lib/community/boardPostCommentActionState.ts", import.meta.url),
  "utf8",
);
const detailRouteSource = readFileSync(
  new URL("../../app/app/hubs/dfw/baseboard/[postId]/page.tsx", import.meta.url),
  "utf8",
);

test("comment report action is server-only, gate-checked, and calls only the report RPC", () => {
  assert.match(actionSource, /"use server"/);
  assert.match(actionSource, /reportDfwBaseboardPostCommentAction/);
  assert.match(actionSource, /getCurrentAppAccessContext/);
  assert.match(actionSource, /getPrivateAppGateResult/);
  assert.match(actionSource, /routeKind: "private-child"/);
  assert.match(actionSource, /recordSecurityEvent/);
  assert.match(actionSource, /action: "report_dfw_baseboard_post_comment"/);
  assert.match(actionSource, /redirect\(gate\.path\)/);
  assert.match(actionSource, /report_open_baseboard_post_comment/);
  assert.match(actionSource, /p_base_code: "DFW"/);
  assert.match(actionSource, /p_comment_id: commentId/);
  assert.match(actionSource, /p_reason: reason/);
  assert.match(actionSource, /p_details: details/);
  assert.match(actionSource, /revalidatePath\(getDfwBaseboardPostHref\(postId\)\)/);
  assert.match(actionSource, /DFW_BASEBOARD_COMMENT_REPORT_REPORTED_STATUS/);
  assert.match(actionSource, /DFW_BASEBOARD_COMMENT_REPORT_INVALID_STATUS/);
  assert.match(actionSource, /DFW_BASEBOARD_COMMENT_REPORT_FAILED_STATUS/);
  assert.match(
    actionSource,
    /getPrivateAppGateResult[\s\S]*if \(gate\.kind === "redirect"\)[\s\S]*report_open_baseboard_post_comment/s,
  );

  assert.doesNotMatch(actionSource, /reporter_user_id|author_user_id|service_role|createBrowserClient|\.insert\(|\.update\(|\.delete\(/i);
});

test("comment report action validates post id, comment id, reason, details, and safe statuses", () => {
  assert.match(actionSource, /String\(formData\.get\("postId"\) \?\? ""\)\.trim\(\)/);
  assert.match(actionSource, /String\(formData\.get\("commentId"\) \?\? ""\)\.trim\(\)/);
  assert.match(actionSource, /String\(formData\.get\("reason"\) \?\? ""\)\.trim\(\)\.toLowerCase\(\)/);
  assert.match(actionSource, /String\(formData\.get\("details"\) \?\? ""\)\.trim\(\)/);
  assert.match(actionSource, /!isUuid\(postId\)/);
  assert.match(actionSource, /!isUuid\(commentId\)/);
  assert.match(actionSource, /!REPORT_REASON_VALUES\.has\(reason\)/);
  assert.match(actionSource, /details\.length > 1000/);
  assert.match(actionStateSource, /DFW_BASEBOARD_COMMENT_REPORT_STATUS_PARAM = "comment_report"/);
  assert.match(actionStateSource, /DFW_BASEBOARD_COMMENT_REPORT_REPORTED_STATUS[\s\S]*"dfw_baseboard_comment_reported"/);
  assert.match(actionStateSource, /DFW_BASEBOARD_COMMENT_REPORT_INVALID_STATUS[\s\S]*"dfw_baseboard_comment_report_invalid"/);
  assert.match(actionStateSource, /DFW_BASEBOARD_COMMENT_REPORT_FAILED_STATUS[\s\S]*"dfw_baseboard_comment_report_failed"/);
  assert.match(actionStateSource, /isDfwBaseboardCommentReportStatus/);
  assert.doesNotMatch(actionStateSource, /eligib|verification|sql|auth|reporter|author/i);
});

test("post detail route wires comment reporting only after the private route gate", () => {
  assert.match(detailRouteSource, /requireDfwHubRouteAccess/);
  assert.match(detailRouteSource, /reportDfwBaseboardPostCommentAction/);
  assert.match(detailRouteSource, /DFW_BASEBOARD_COMMENT_REPORT_STATUS_PARAM/);
  assert.match(detailRouteSource, /isDfwBaseboardCommentReportStatus/);
  assert.match(detailRouteSource, /commentReportStatus=\{commentReportStatus\}/);
  assert.match(detailRouteSource, /reportCommentAction=\{reportDfwBaseboardPostCommentAction\}/);
  assert.match(
    detailRouteSource,
    /await requireDfwHubRouteAccess[\s\S]*getDfwBaseboardPost[\s\S]*listDfwBaseboardPostComments/s,
  );
  assert.doesNotMatch(detailRouteSource, /report_open_baseboard_post_comment[\s\S]*return \(/);
  assert.doesNotMatch(detailRouteSource, /\.insert\(|\.update\(|\.delete\(/);
});
