export const DFW_BASEBOARD_COMMENT_STATUS_PARAM = "comment";
export const DFW_BASEBOARD_COMMENT_CREATED_STATUS = "dfw_baseboard_comment_created";
export const DFW_BASEBOARD_COMMENT_INVALID_STATUS = "dfw_baseboard_comment_invalid";
export const DFW_BASEBOARD_COMMENT_FAILED_STATUS = "dfw_baseboard_comment_failed";

export type DfwBaseboardCommentStatus =
  | typeof DFW_BASEBOARD_COMMENT_CREATED_STATUS
  | typeof DFW_BASEBOARD_COMMENT_INVALID_STATUS
  | typeof DFW_BASEBOARD_COMMENT_FAILED_STATUS;

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
