import "server-only";

import { createClient } from "../supabase/server";

const DEFAULT_COMMENT_LIMIT = 100;
const FALLBACK_AUTHOR_LABEL = "jmpseat member";

export type BaseboardPostComment = {
  id: string;
  postId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  authorLabel: string;
};

type OpenBaseboardPostCommentRpcRow = {
  id: string;
  post_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  author_label: string | null;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function getSafeAuthorLabel(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized || FALLBACK_AUTHOR_LABEL;
}

function mapCommentRow(
  row: OpenBaseboardPostCommentRpcRow,
): BaseboardPostComment {
  return {
    id: row.id,
    postId: row.post_id,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    authorLabel: getSafeAuthorLabel(row.author_label),
  };
}

export async function listDfwBaseboardPostComments(
  postId: string,
  limit = DEFAULT_COMMENT_LIMIT,
) {
  const normalizedPostId = postId.trim();

  if (!isUuid(normalizedPostId)) {
    return {
      comments: [],
      error: null,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("list_open_baseboard_post_comments", {
      p_base_code: "DFW",
      p_post_id: normalizedPostId,
      p_limit: limit,
    })
    .returns<OpenBaseboardPostCommentRpcRow[]>();

  if (error) {
    return {
      comments: [],
      error,
    };
  }

  return {
    comments: (Array.isArray(data) ? data : []).map(mapCommentRow),
    error: null,
  };
}
