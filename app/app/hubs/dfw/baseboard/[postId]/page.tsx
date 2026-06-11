import {
  DfwBaseboardPostDetailShell,
} from "../../../../../../src/components/privateApp/HomeHubShell";
import {
  DFW_BASEBOARD_COMMENT_REPORT_STATUS_PARAM,
  DFW_BASEBOARD_COMMENT_STATUS_PARAM,
  isDfwBaseboardCommentReportStatus,
  isDfwBaseboardCommentStatus,
} from "../../../../../../src/lib/community/boardPostCommentActionState";
import {
  createDfwBaseboardPostCommentAction,
  reportDfwBaseboardPostCommentAction,
} from "../../../../../../src/lib/community/boardPostCommentActions";
import { listDfwBaseboardPostComments } from "../../../../../../src/lib/community/boardPostComments";
import { getDfwBaseboardPost } from "../../../../../../src/lib/community/boardPostReads";
import {
  DFW_BASEBOARD_REPORT_STATUS_PARAM,
  isDfwBaseboardReportStatus,
} from "../../../../../../src/lib/community/boardPostSafetyActionState";
import { reportDfwBaseboardPostAction } from "../../../../../../src/lib/community/boardPostSafetyActions";
import { requireDfwHubRouteAccess } from "../../../../../../src/lib/privateApp/dfwHubAccess";

const DFW_BASEBOARD_ROUTE = "/app/hubs/dfw/baseboard";

export const dynamic = "force-dynamic";

type DfwBaseboardPostDetailPageProps = {
  params: Promise<{
    postId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DfwBaseboardPostDetailPage({
  params,
  searchParams,
}: DfwBaseboardPostDetailPageProps) {
  await requireDfwHubRouteAccess({
    route: DFW_BASEBOARD_ROUTE,
    section: "dfw-baseboard",
  });

  const [{ postId }, query] = await Promise.all([params, searchParams]);
  const reportStatusValue = query[DFW_BASEBOARD_REPORT_STATUS_PARAM];
  const reportStatus = isDfwBaseboardReportStatus(reportStatusValue)
    ? reportStatusValue
    : null;
  const commentStatusValue = query[DFW_BASEBOARD_COMMENT_STATUS_PARAM];
  const commentStatus = isDfwBaseboardCommentStatus(commentStatusValue)
    ? commentStatusValue
    : null;
  const commentReportStatusValue = query[DFW_BASEBOARD_COMMENT_REPORT_STATUS_PARAM];
  const commentReportStatus = isDfwBaseboardCommentReportStatus(
    commentReportStatusValue,
  )
    ? commentReportStatusValue
    : null;
  const postResult = await getDfwBaseboardPost(postId);
  const commentResult = await listDfwBaseboardPostComments(postId);

  return (
    <DfwBaseboardPostDetailShell
      commentStatus={commentStatus}
      commentReportStatus={commentReportStatus}
      comments={commentResult.comments}
      commentsUnavailable={Boolean(commentResult.error)}
      createCommentAction={createDfwBaseboardPostCommentAction}
      post={postResult.post}
      postUnavailable={Boolean(postResult.error)}
      reportAction={reportDfwBaseboardPostAction}
      reportCommentAction={reportDfwBaseboardPostCommentAction}
      reportStatus={reportStatus}
    />
  );
}
