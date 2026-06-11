import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const helperSource = readFileSync(
  new URL("../../src/lib/admin/communityModerationReports.ts", import.meta.url),
  "utf8",
);
const pageSource = readFileSync(
  new URL("../../app/app/admin/community-moderation/page.tsx", import.meta.url),
  "utf8",
);
const shellSource = readFileSync(
  new URL("../../src/components/privateApp/HomeHubShell.tsx", import.meta.url),
  "utf8",
);
const docsSource = [
  "../../docs/ops/fbmvp-t20-dfw-baseboard-comment-reporting-review.md",
  "../../docs/BUILD_TICKETS.md",
  "../../docs/DATA_MODEL.md",
  "../../docs/ops/05b-first-base-mvp-planning.md",
]
  .map((docPath) =>
    existsSync(new URL(docPath, import.meta.url))
      ? readFileSync(new URL(docPath, import.meta.url), "utf8")
      : "",
  )
  .join("\n\n");

test("server-only moderation helper reads safe comment report fields from the new RPC", () => {
  assert.match(helperSource, /import "server-only"/);
  assert.match(helperSource, /CommunityModerationCommentReport/);
  assert.match(helperSource, /getDfwBaseboardCommentModerationReports/);
  assert.match(helperSource, /list_open_baseboard_post_comment_reports/);
  assert.match(helperSource, /p_base_code:\s*"DFW"/);
  assert.match(helperSource, /commentBodyPreview/);
  assert.match(helperSource, /commentAuthorLabel/);
  assert.match(helperSource, /postTitlePreview/);
  assert.doesNotMatch(
    helperSource,
    /reporter_user_id|reporterEmail|author_user_id|authorUserId|claimed|verification|evidence|proof|storage|signed|private/i,
  );
});

test("community moderation page extends existing operator-gated route with comment reports", () => {
  assert.match(pageSource, /getDfwBaseboardModerationReports/);
  assert.match(pageSource, /getDfwBaseboardCommentModerationReports/);
  assert.match(pageSource, /operatorCanModerate/);
  assert.match(pageSource, /Promise\.all/);
  assert.match(pageSource, /Open DFW Baseboard comment reports/);
  assert.match(pageSource, /moderateDfwBaseboardPostAction/);
  assert.match(pageSource, /moderateDfwBaseboardPostCommentAction/);
  assert.match(pageSource, /name="commentId"/);
  assert.match(pageSource, /value="hide"/);
  assert.match(pageSource, /value="remove"/);
  assert.match(pageSource, /name="reason"/);
  assert.match(pageSource, /commentBodyPreview/);
  assert.match(pageSource, /postTitlePreview/);
  assert.doesNotMatch(
    pageSource,
    /reporter_user_id|reporter email|author_user_id|comment moderation queue|ban|suspend|appeal|AI moderation|public sharing/i,
  );
});

test("comment UI includes compact report affordance without replies or client writes", () => {
  const commentsSectionSource = shellSource.slice(
    shellSource.indexOf("function DfwBaseboardCommentsSection"),
  );

  assert.match(shellSource, /reportCommentAction\?:/);
  assert.match(shellSource, /commentReportStatus\?:/);
  assert.match(shellSource, /Report this comment/);
  assert.match(commentsSectionSource, /name="postId"/);
  assert.match(shellSource, /name="commentId"/);
  assert.match(shellSource, /value=\{commentId\}/);
  assert.match(commentsSectionSource, /commentId=\{comment\.id\}/);
  assert.match(shellSource, /Thanks — the comment was reported for review\./);
  assert.match(shellSource, /Choose a report reason before submitting\./);
  assert.match(shellSource, /jmpseat could not submit that report right now\. Try again in a moment\./);
  assert.match(shellSource, /maxLength=\{1000\}/);
  assert.doesNotMatch(
    commentsSectionSource,
    /reply form|nested replies|save button|reaction button|search backend|public sharing|createBrowserClient|\.insert\(|\.update\(|\.delete\(/i,
  );
});

test("T20 docs preserve runtime-applied status and scope boundaries", () => {
  assert.match(docsSource, /Status: runtime-applied|T20 is runtime-applied/i);
  assert.match(docsSource, /runtime-applied/i);
  assert.match(docsSource, /comment reporting/i);
  assert.match(docsSource, /moderation review integration/i);
  assert.match(docsSource, /operator\.community_moderation/i);
  assert.match(docsSource, /existing comment hide\/remove/i);
  assert.match(docsSource, /reporter identity/i);
  assert.match(docsSource, /zero direct `board_posts` write policies/i);
  assert.match(docsSource, /broad Supabase `db push` remains unsafe/i);
  assert.match(docsSource, /T20 runtime-pass docs are committed/i);
  assert.match(docsSource, /First Base \/ DFW\s+Baseboard safety loop/i);
  assert.match(docsSource, /bad2110/i);
  assert.match(docsSource, /5e65f7b/i);
  assert.match(docsSource, /pre-beta-launch verification item/i);
  assert.match(docsSource, /Baseboards pivot workshop/i);
  assert.doesNotMatch(docsSource, /nested replies are live|bans are live|appeals are live/i);
});
