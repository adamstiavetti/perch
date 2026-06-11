export const DFW_BASEBOARD_COMMENT_STATUS_PARAM = "comment";
export const DFW_BASEBOARD_COMMENT_CREATED_STATUS = "dfw_baseboard_comment_created";
export const DFW_BASEBOARD_COMMENT_INVALID_STATUS = "dfw_baseboard_comment_invalid";
export const DFW_BASEBOARD_COMMENT_FAILED_STATUS = "dfw_baseboard_comment_failed";
export const DFW_BASEBOARD_COMMENT_REPORT_STATUS_PARAM = "comment_report";
export const DFW_BASEBOARD_COMMENT_REPORT_REPORTED_STATUS =
  "dfw_baseboard_comment_reported";
export const DFW_BASEBOARD_COMMENT_REPORT_INVALID_STATUS =
  "dfw_baseboard_comment_report_invalid";
export const DFW_BASEBOARD_COMMENT_REPORT_FAILED_STATUS =
  "dfw_baseboard_comment_report_failed";

export type DfwBaseboardCommentStatus =
  | typeof DFW_BASEBOARD_COMMENT_CREATED_STATUS
  | typeof DFW_BASEBOARD_COMMENT_INVALID_STATUS
  | typeof DFW_BASEBOARD_COMMENT_FAILED_STATUS;

export type DfwBaseboardCommentReportStatus =
  | typeof DFW_BASEBOARD_COMMENT_REPORT_REPORTED_STATUS
  | typeof DFW_BASEBOARD_COMMENT_REPORT_INVALID_STATUS
  | typeof DFW_BASEBOARD_COMMENT_REPORT_FAILED_STATUS;

const dfwBaseboardCommentStatuses = new Set<string>([
  DFW_BASEBOARD_COMMENT_CREATED_STATUS,
  DFW_BASEBOARD_COMMENT_INVALID_STATUS,
  DFW_BASEBOARD_COMMENT_FAILED_STATUS,
]);

export function isDfwBaseboardCommentStatus(
  value: string | string[] | undefined,
): value is DfwBaseboardCommentStatus {
  return typeof value === "string" && dfwBaseboardCommentStatuses.has(value);
}

const dfwBaseboardCommentReportStatuses = new Set<string>([
  DFW_BASEBOARD_COMMENT_REPORT_REPORTED_STATUS,
  DFW_BASEBOARD_COMMENT_REPORT_INVALID_STATUS,
  DFW_BASEBOARD_COMMENT_REPORT_FAILED_STATUS,
]);

export function isDfwBaseboardCommentReportStatus(
  value: string | string[] | undefined,
): value is DfwBaseboardCommentReportStatus {
  return (
    typeof value === "string" && dfwBaseboardCommentReportStatuses.has(value)
  );
}
